import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join as joinPath, resolve as pathResolve } from "node:path";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { wait } from "@jabascript/core";
import { TRPCError } from "@trpc/server";
import { NextResponse } from "next/server";
import { UserRole, type NewsOutlet, type Reporter } from "@prisma/client";

import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import { runScraper } from "~/server/sync/scraper";
import { getCoverImage, getSiteFavicon } from "~/server/sync/web";
import { factCheckingModel, summarizationModel } from "~/server/ai";
import { isMostlyEnglish, readClusteredArticles } from "~/server/sync/utils";
import type {
	ClusteredSourceArticles,
	ClusteredSummaryFactualityReport,
	SourceArticle,
	SummarizedArticle,
} from "~/server/sync/types";
import {
	type ArticleSummary,
	type StoryFactualityReport,
	ARTICLE_SUMMARY,
	STORY_FACTUALITY_REPORT,
} from "~/server/sync/models";

export const runtime = "nodejs";

const DATA_FOLDER = joinPath("news_data");
const DATA_FILE = joinPath(DATA_FOLDER, "articles.json");
const CLUSTERED_FILE = joinPath(DATA_FOLDER, "clustered.json");

const log = (...msg: string[]) => console.log(`[sync]`, ...msg);

export const POST = auth(async function POST(req) {
	if (req.auth?.user.role !== UserRole.ADMIN) {
		return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
	}

	log("Scraping articles...");
	const scrapped = await runScraper();
	const lastDBUpdate = await api.configuration.getLastSync();

	const newArticles = scrapped.filter(
		(x) => isMostlyEnglish(x.title) && x.publishedAt > lastDBUpdate,
	);

	log(`Found ${newArticles.length} new articles`);
	if (newArticles.length === 0) return NextResponse.json({ status: "ok" });

	try {
		if (!existsSync(DATA_FOLDER)) await mkdir(DATA_FOLDER, { recursive: true });
		await writeFile(DATA_FILE, JSON.stringify(newArticles, null, 4));
	} catch (error) {
		console.error("Failed to write articles to disk:", error);
		return NextResponse.json({ status: "error" });
	}

	log("Clustering articles...");

	try {
		const file = pathResolve("./src/app/api/sync/grouping.py");
		const pipenvProcess = spawnSync("pipenv", ["run", "python", file], {
			cwd: process.cwd(),
			stdio: "inherit",
		});

		if (pipenvProcess.stderr) return NextResponse.json({ status: "error" });
	} catch (error) {
		console.error("Error running grouping.py:", error);
		return NextResponse.json({ status: "error" });
	}

	const summarized: Record<string, ClusteredSummaryFactualityReport[]> = {};

	const clusteredArticles = await readClusteredArticles(CLUSTERED_FILE);
	const keys = Object.keys(clusteredArticles) as (keyof ClusteredSourceArticles)[];

	for (const key of keys) {
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
		const externalCoverImage = articles.find((x) => !!x.coverImageUrl);

		if (externalCoverImage) {
			try {
				const image = await getCoverImage(
					externalCoverImage.coverImageUrl!,
					selected.temp_id,
				);
				coverImage = image.url;
			} catch (error) {
				console.error(error);
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
				(x) => x.name === current.author.name,
			);
			let currentOutlet: (typeof tempOutlets)[0] | undefined = tempOutlets.find(
				(x) => x.name === current.outlet,
			);

			if (currentReporter === undefined) {
				log(`Creating reporter ${current.author}...`);

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
					publishedAt: new Date(current.publishedAt).toISOString(),
					content: current.body.join("\n"),
					reporterId: currentReporter.id,
					outletId: currentOutlet.id,
					factuality: current.factuality,
				})
				.catch((e: TRPCError) => {
					if (e.code === "CONFLICT") {
						log(e.cause!.message);
						return;
					}

					console.error(e);
					console.dir(current, { depth: null });

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

	await api.configuration.updateLastSync({ value: new Date().toISOString() });

	return NextResponse.json({ status: "ok" });
});

async function summarize(article: SourceArticle): Promise<ArticleSummary> {
	const model = summarizationModel()
		.withStructuredOutput(ARTICLE_SUMMARY)
		.withRetry({ stopAfterAttempt: 4 });
	const prompt = `Return a summary of the news article in a readable point format. Try not to span to more than 6 points.
	Return a valid JSON following the example format: {{ "summary": ["point 1", "point 2", "point 3"] }}`;

	return await model.invoke([
		{ role: "system", content: prompt },
		{ role: "user", content: article.body.join("\n") },
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
	article: Pick<ClusteredSummaryFactualityReport, "outlet" | "url">,
) {
	const url = new URL(article.url);

	try {
		const old = await api.newsOutlet.getByUrl({ url: url.origin });
		return { id: old.id, name: old.name };
	} catch (error) {
		if (!(error instanceof TRPCError && error.code === "NOT_FOUND")) throw error;
	}

	const icon = await getSiteFavicon(article.url);
	const outlet = await api.newsOutlet.create({
		name: article.outlet,
		url: url.origin,
		logoUrl: icon?.url ?? undefined,
	});

	return { id: outlet.id, name: outlet.name };
}

async function getOrCreateReporter(
	article: Pick<ClusteredSummaryFactualityReport, "outlet" | "author">,
) {
	try {
		const cleanup = (name: string) => name.split(" ").join("").toLocaleLowerCase();
		const reporter = await api.reporter.create({
			name: article.author.name,
			isSystem: article.author.isSystem,
			email: article.author.isSystem
				? `${article.author.name}@truelens.lk`
				: `${cleanup(article.author.name)}@${cleanup(article.outlet)}.lk`,
		});

		return { id: reporter.id, name: reporter.name };
	} catch (error) {
		if (error instanceof TRPCError && error.cause && "reporterId" in error.cause) {
			return { id: error.cause.reporterId as string, name: article.author.name };
		}

		console.error("Failed to create reporter:", error, article);
		throw error;
	}
}
