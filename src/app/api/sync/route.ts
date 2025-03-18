import { randomUUID } from "node:crypto";
import { stat, copyFile, mkdir } from "node:fs/promises";
import { join as pathJoin, resolve as pathResolve } from "node:path";
import { spawnSync } from "node:child_process";

import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import type { Groq } from "groq-sdk";
import { wait } from "@jabascript/core";
import type { NewsOutlet, Reporter } from "@prisma/client";
import { TRPCError } from "@trpc/server";

// import { env } from "~/env";
import { groqClient } from "~/server/ai";
import { db } from "~/server/db";
import { api } from "~/trpc/server";

import { isMostlyEnglish, readClustered, readMetadata } from "~/app/api/sync/utils";
// import { WebScraper } from "~/app/api/sync/web";
import type {
	ClusteredArticles,
	ClusteredSummaryFactualityReport,
	FactualityReport,
	SourceArticle,
	SummarizedArticle,
} from "~/app/api/sync/types";

export const runtime = "nodejs";

const repoOwner = "nuuuwan";
const repoName = "news_long_lk";

const sourcePath = pathJoin("news_source_data");
const sourceDataPath = pathJoin(sourcePath, "data");
const targetPath = pathJoin("news_filtered_data");

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

	for (let i = 0; i < newArticles.length; i++) {
		const meta = newArticles.at(i);
		if (!meta) continue;

		const articlePath = pathJoin(sourcePath, meta.dir_path_unix);
		const folderName = articlePath.split("/").at(-1) || "not-found" + i;

		const targetFolder = pathJoin(targetPath, folderName);
		await mkdir(targetFolder, { recursive: true });
		await copyFile(
			pathJoin(articlePath, "article.json"),
			pathJoin(targetFolder, "article.json"),
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
				article.summary = await summarize(article);

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
			const factualized = await factualize(articles);

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

		// TODO(Curstantine):
		// Kirushna, add the cover fetching here. Use the selected url and include it as property of the api.story.create below.
		const story = await api.story.create({
			title: selected.title,
			summary: selected.summary,
			cover: undefined,
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

			runningTasks.push(
				api.article.create({
					title: current.title,
					storyId: story.id,
					externalUrl: current.url,
					publishedAt: new Date(current.ut).toISOString(),
					content: current.body_paragraphs,
					reporterId: currentReporter.id,
					outletId: currentOutlet.id,
					factuality: current.factuality,
				}),
			);
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

	// Example usage of WebScraper
	// const scraper = new WebScraper();
	// const url =
	// 	"https://www.dailymirror.lk/opinion/Beyond-Red-Tape-How-Digitalization-Can-Save-Sri-Lankas-Economy/231-292314";
	// const outlet = "Daily Mirror";

	// const image = await scraper.scrapeCoverImage(url, outlet);
	// console.log("Scraped image URL:", image);

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

async function summarize(article: SourceArticle) {
	const client = groqClient();
	const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
		{
			role: "system",
			content: `Return a normalized summary of the news article in a readable point form that is no longer than 100 words in each point.
			The data should be returned in JSON, following the format { summary: string[] }.
			Each point should be inside the array. Change any double quotes inside the article to single quotes to avoid JSON parsing errors.
			
			An example of the format is:
			{ summary: ["Point 1", "Point 2", "Point 3 with 'quotes' inside"] }`,
		},
		{
			role: "user",
			content: article.body_paragraphs,
		},
	];

	const completion = await client.chat.completions.create({
		model: "llama-3.1-8b-instant",
		temperature: 0.85,
		max_completion_tokens: 1024,
		top_p: 1,
		stream: false,
		response_format: {
			type: "json_object",
		},
		stop: null,
		messages,
	});

	const summaryText = completion.choices[0]?.message.content;
	if (!summaryText) throw new Error("Summary was empty");

	const doc = JSON.parse(summaryText) as Pick<SummarizedArticle, "summary">;
	return doc.summary;
}

async function factualize(articles: SummarizedArticle[]) {
	const client = groqClient();
	const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
		{
			role: "system",
			content: `Return a factuality report from each outlet. The factuality is calculated by averaging what has happened in each article.
				The data must be returned in JSON format, paired by the temp_id, which should not be changed as they are used to identify the articles.
				Follow the format: { data: { temp_id: string, 'factuality': float }[] }.`,
		},
		...articles.map((x) => {
			// Note(Curstantine):
			// Limit the article body size to 100000 characters to avoid hitting the token limit.
			const body = x.summary.join(" ").slice(0, 100000 / articles.length);
			return {
				role: "user",
				content: [
					{ type: "text", text: `temp_id: ${x.temp_id}` },
					{ type: "text", text: `Body: ${body}` },
				],
			} as Groq.Chat.Completions.ChatCompletionMessageParam;
		}),
	];

	const completion = await client.chat.completions.create({
		model: "deepseek-r1-distill-llama-70b",
		temperature: 0.6,
		max_completion_tokens: 4096,
		top_p: 0.95,
		stream: false,
		response_format: {
			type: "json_object",
		},
		stop: null,
		messages,
	});

	const reportText = completion.choices[0]?.message.content;
	if (!reportText) throw new Error("Factuality report was empty");

	return JSON.parse(reportText).data as FactualityReport[];
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
