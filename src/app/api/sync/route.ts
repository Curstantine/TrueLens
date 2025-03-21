import { randomUUID } from "node:crypto";
import { stat, copyFile, mkdir, rm } from "node:fs/promises";
import { join as pathJoin, resolve as pathResolve, basename } from "node:path";
import { spawnSync } from "node:child_process";

import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import { wait } from "@jabascript/core";
import type { NewsOutlet, Reporter } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { factCheckingModel, summarizationModel } from "~/server/ai";
import { db } from "~/server/db";
import { api } from "~/trpc/server";

import { isMostlyEnglish, readClustered, readMetadata } from "~/app/api/sync/utils";
import {
	getCoverImageUrl,
	isCoverImageSupported,
	UnsupportedWebsiteError,
} from "~/app/api/sync/web";
import type {
	ClusteredArticles,
	ClusteredSummaryFactualityReport,
	SourceArticle,
	SummarizedArticle,
} from "~/app/api/sync/types";
import {
	type ArticleSummary,
	type StoryFactualityReport,
	ARTICLE_SUMMARY,
	STORY_FACTUALITY_REPORT,
} from "~/app/api/sync/validation";

export const runtime = "nodejs";

const repoOwner = "nuuuwan";
const repoName = "news_long_lk";

const sourcePath = pathJoin("news_source_data");
const sourceDataPath = pathJoin(sourcePath, "data");
const targetPath = pathJoin("news_filtered_data");
const targetDataPath = pathJoin(targetPath, "data");

const log = (...msg: string[]) => console.log(`[sync]`, ...msg);

export async function POST() {
	try {
		await cloneOrReuse();
	} catch (e) {
		console.error("Failed to clone or reuse repository: ", e);
		return NextResponse.json({ status: "error" });
	}

	const metadata = await readMetadata(sourceDataPath);
	const lastDBUpdate = await db.configuration.findUnique({
		where: { key: "LAST_SYNC_DATE" },
		select: { value: true },
	});

	const lastSync = new Date(lastDBUpdate?.value ?? 0).getTime() / 1000;
	const newArticles = metadata.filter((x) => isMostlyEnglish(x.title) && x.ut > lastSync);

	log(`Found ${newArticles.length} new articles`);
	if (newArticles.length === 0) return NextResponse.json({ status: "ok" });

	try {
		await rm(targetDataPath, { recursive: true });
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
			console.error("Failed to remove target data path:", error);
			return NextResponse.json({ status: "error" });
		}
	} finally {
		await mkdir(targetDataPath, { recursive: true });
	}

	for (let i = 0; i < newArticles.length; i++) {
		const meta = newArticles[i]!;

		const articlePath = pathJoin(sourcePath, meta.dir_path_unix);
		const folderName = basename(articlePath);

		await copyFile(
			pathJoin(articlePath, "article.json"),
			pathJoin(targetDataPath, `${folderName}.json`),
		);
	}

	log("Clustering articles...");

	try {
		const file = pathResolve("./src/app/api/sync/grouping.py");
		const pipenvProcess = spawnSync("pipenv", ["run", "python", file, lastSync.toString()], {
			cwd: process.cwd(),
			stdio: "inherit",
		});

		if (pipenvProcess.stderr) return NextResponse.json({ status: "error" });
	} catch (error) {
		console.error("Error running grouping.py:", error);
		return NextResponse.json({ status: "error" });
	}

	const summarized: Record<string, ClusteredSummaryFactualityReport[]> = {};

	const clusteredArticles = await readClustered(targetPath);
	const keys = Object.keys(clusteredArticles) as (keyof ClusteredArticles)[];

	for (const key of keys) {
		if (key === "outliers") continue;

		const cluster = clusteredArticles[key]!;
		log(`Summarizing cluster ${key} with ${cluster.length} articles...`);

		try {
			for (let i = 0; i < cluster.length; i++) {
				log(`\t\tRunning article [${i + 1}/${cluster.length}]...`);
				const article = cluster[i] as SummarizedArticle;
				article.summary = (await summarize(article)).summary;

				summarized[key] ??= [];
				summarized[key]!.push({ ...article, factuality: 0, temp_id: randomUUID() });

				await wait(250);
			}
		} catch (error) {
			console.error("Failed to summarize articles:\n\t", error);
			return NextResponse.json({ status: "error" });
		}

		log(`Factualizing cluster ${key}...`);
		try {
			const articles = summarized[key]!;
			const factualized = (await factualize(articles)).data;

			for (let i = 0; i < factualized.length; i++) {
				const data = factualized[i]!;
				const idx = articles.findIndex((x) => x.temp_id === data.temp_id);

				if (idx === -1) {
					console.error("Failed to find article for factuality:", data);
					return NextResponse.json({ status: "error" });
				}

				articles[idx]!.factuality = data.factuality;
			}
		} catch (error) {
			console.error("Failed to factualize articles:\n\t", error);
			return NextResponse.json({ status: "error" });
		}

		const articles = summarized[key]!;
		const selected = articles.sort((a, b) => b.factuality - a.factuality)[0];
		if (!selected) {
			console.error("This cluster has no articles! Cluster ID:", key);
			return NextResponse.json({ status: "error" });
		}

		log("Scraping cover image for the story...");
		let coverImage: string | undefined;
		const supportedCoverSite = isCoverImageSupported(selected.url)
			? selected
			: articles.find((x) => isCoverImageSupported(x.url));

		if (supportedCoverSite) {
			try {
				const image = await getCoverImageUrl(supportedCoverSite.url, selected.temp_id);
				coverImage = image.url;
			} catch (error) {
				console.error(error);

				if (!(error instanceof UnsupportedWebsiteError)) {
					return NextResponse.json({ status: "error" });
				}
			}
		}

		const story = await api.story.create({
			title: selected.title,
			summary: selected.summary,
			cover: coverImage,
		});

		const runningTasks: Promise<unknown>[] = [];
		const tempReporters: Pick<Reporter, "id" | "name">[] = [];
		const tempOutlets: Pick<NewsOutlet, "id" | "name">[] = [];

		for (let i = 0; i < articles.length; i++) {
			const current = articles[i]!;
			let currentReporter: (typeof tempReporters)[0] | undefined = tempReporters.find(
				(x) => x.name === current.reporter,
			);
			let currentOutlet: (typeof tempOutlets)[0] | undefined = tempOutlets.find(
				(x) => x.name === current.outlet,
			);

			if (currentReporter === undefined) {
				log(`Creating reporter ${current.reporter}...`);

				try {
					currentReporter = await getOrCreateReporter(current);
					tempReporters.push(currentReporter);
				} catch (error) {
					console.error("Failed to create reporter:", error);
					return NextResponse.json({ status: "error" });
				}
			}

			if (currentOutlet === undefined) {
				log(`Creating outlet ${current.outlet}...`);

				try {
					currentOutlet = await getOrCreateOutlet(current);
					tempOutlets.push(currentOutlet);
				} catch (error) {
					console.error("Failed to create outlet:", error);
					return NextResponse.json({ status: "error" });
				}
			}

			const task = api.article
				.create({
					title: current.title,
					storyId: story.id,
					externalUrl: current.url,
					publishedAt: new Date(current.ut).toISOString(),
					content: current.body_paragraphs,
					reporterId: currentReporter.id,
					outletId: currentOutlet.id,
					factuality: current.factuality,
				})
				.catch((e: TRPCError) => {
					if (e.code === "CONFLICT") {
						log(e.cause!.message);
						return;
					}

					throw e;
				});

			runningTasks.push(task);
		}

		try {
			await Promise.all(runningTasks);
			log(
				`Completed cluster ${key}`,
				`with ${articles.length} articles, ${tempReporters.length} reporters`,
			);
		} catch (error) {
			console.error("Failed to create articles:", error);
			return NextResponse.json({ status: "error" });
		}
	}

	await db.configuration.update({
		where: { key: "LAST_SYNC_DATE" },
		data: { value: new Date().toISOString() },
	});

	return NextResponse.json({ status: "ok" });
}

async function cloneOrReuse() {
	const git = simpleGit();
	const dirExists = await stat(sourcePath)
		.then((e) => e.isDirectory())
		.catch(() => false);

	if (dirExists) {
		log("Pulling latest changes...");

		await git.cwd(sourcePath).pull("origin", "main");
		log("Repository updated successfully!");

		return;
	}

	log("Cloning repository...");
	await git.clone(`https://github.com/${repoOwner}/${repoName}.git`, sourcePath, {
		"--depth": 1,
	});

	log("Repository cloned successfully!");
}

async function summarize(article: SourceArticle): Promise<ArticleSummary> {
	const model = summarizationModel()
		.withStructuredOutput(ARTICLE_SUMMARY)
		.withRetry({ stopAfterAttempt: 3 });
	const prompt = `Return a summary of the news article in a readable point format. Try not to span to more than 6 points.
	Return a valid JSON following the example format: {{ "summary": ["point 1", "point 2", "point 3"] }}`;

	return await model.invoke([
		{ role: "system", content: prompt },
		{ role: "user", content: article.body_paragraphs },
	]);
}

async function factualize(articles: SummarizedArticle[]): Promise<StoryFactualityReport> {
	const model = factCheckingModel()
		.withStructuredOutput(STORY_FACTUALITY_REPORT)
		.withRetry({ stopAfterAttempt: 2 });
	const prompt = `Return a factuality report from each outlet. The factuality is calculated by averaging what has happened in each article.
	The data must be returned in JSON format, paired by the temp_id, which should not be changed as they are used to identify the articles.
	Factuality is a float between 0 and 1, where 0 is completely false and 1 is completely true.
	
	EXAMPLE OUTPUT:
	{
		data: [
			{ temp_id: 'temp_id_1', factuality: 0.8 },
			{ temp_id: 'temp_id_2', factuality: 0.6 },
			{ temp_id: 'temp_id_3', factuality: 0.4 },
		]
	}`;

	return await model.invoke([
		{ role: "system", content: prompt },
		{
			role: "user",
			content: articles
				.map((x) => `temp_id: ${x.temp_id}\nSummary: ${x.summary.join(" ")}`)
				.join("\n\n"),
		},
	]);
}

async function getOrCreateOutlet(
	article: Pick<ClusteredSummaryFactualityReport, "outlet"> & { logoUrl?: string },
) {
	try {
		const outlet = await api.newsOutlet.create({
			name: article.outlet,
			logoUrl: article.logoUrl,
		});

		return { id: outlet.id, name: outlet.name };
	} catch (error) {
		if (error instanceof TRPCError && error.cause && "outletId" in error.cause) {
			return { id: error.cause.outletId as string, name: article.outlet };
		}

		throw error;
	}
}

async function getOrCreateReporter(
	article: Pick<ClusteredSummaryFactualityReport, "is_system" | "outlet" | "reporter">,
) {
	try {
		const cleanup = (name: string) => name.split(" ").join("_").toLocaleLowerCase();
		const reporter = await api.reporter.create({
			name: article.reporter,
			isSystem: article.is_system,
			email: article.is_system
				? `${article.reporter}@truelens.lk`
				: `${cleanup(article.reporter)}@${cleanup(article.outlet)}.lk`,
		});

		return { id: reporter.id, name: reporter.name };
	} catch (error) {
		if (error instanceof TRPCError && error.cause && "reporterId" in error.cause) {
			return { id: error.cause.reporterId as string, name: article.reporter };
		}

		throw error;
	}
}
