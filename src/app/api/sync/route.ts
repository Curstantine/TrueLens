import { stat, copyFile, mkdir } from "node:fs/promises";
import { join as pathJoin, resolve as pathResolve } from "node:path";
import { spawnSync } from "node:child_process";

import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import type { Groq } from "groq-sdk";
import { wait } from "@jabascript/core";

import { isMostlyEnglish, readClustered, readMetadata } from "~/app/api/sync/utils";
import { db } from "~/server/db";
// import { WebScraper } from "~/app/api/sync/web";
import { groqClient } from "~/server/ai";
import { ClusteredArticles, SourceArticle, SummarizedArticle } from "~/app/api/sync/types";

export const runtime = "nodejs";

const repoOwner = "nuuuwan";
const repoName = "news_long_lk";

const sourcePath = pathJoin("news_source_data");
const sourceDataPath = pathJoin(sourcePath, "data");
const targetPath = pathJoin("news_filtered_data");

const log = (msg: string) => console.log(`[sync] ${msg}`);

export async function POST() {
	try {
		await cloneOrReuse();
	} catch (e) {
		console.error("Failed to clone or reuse repository: ", e);
		return NextResponse.json({ status: "error" });
	}

	const metadata = await readMetadata(sourceDataPath);
	const lastDBUpdate = await db.configuration.findUnique({
		where: { key: "lastDBUpdate" },
		select: { value: true },
	});

	const lastUpdate = Number(lastDBUpdate?.value || 0);
	const newArticles = metadata.filter((x) => isMostlyEnglish(x.title) && x.ut > lastUpdate);

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

		const pp = spawnSync("pipenv", ["run", "python", file], {
			cwd: process.cwd(),
			stdio: "inherit",
		});

		if (pp.stderr) return NextResponse.json({ status: "error" });
	} catch (error) {
		console.error("Error running grouping.py:", error);
		return NextResponse.json({ status: "error" });
	}

	log("Summarizing articles...");
	const summarized: Record<string, SourceArticle[]> = {};

	try {
		const articles = await readClustered(targetPath);
		const keys = Object.keys(articles) as (keyof ClusteredArticles)[];

		for (const key of keys) {
			if (key === "outliers") continue;

			const cluster = articles[key]!;
			log(`Summarizing cluster ${key} [${cluster.length} articles]...`);

			for (let i = 0; i < cluster.length; i++) {
				const article = cluster[i] as SummarizedArticle;
				article.summary = await summarize(article);
				await wait(1000);
			}

			const factualized = await factualize(cluster);
			console.dir({ clusterId: key, factualized }, { depth: null });
		}
	} catch (error) {
		console.error("Failed to summarizing articles:\n\t", error);
		return NextResponse.json({ status: "error" });
	}

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

async function factualize(articles: SourceArticle[]) {
	const client = groqClient();
	const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
		{
			role: "system",
			content:
				"Return a factuality report from each outlet. Get the factuality by getting the average of what has happened. Factuality should be returned in JSON format paired by the outlet name following the format: { 'outlet_name': string, 'factuality': float }",
		},
		...articles.map((x) => {
			// Note(Curstantine):
			// Limit the article body size to 6000 characters to avoid hitting the token limit.
			const body = x.body_paragraphs.split(" ").slice(0, 6000).join(" ");
			return {
				role: "user",
				content: `Outlet: ${x.outlet}\nTitle: ${x.title}\nBody: ${body}`,
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

	const factual = completion.choices[0]?.message.content;
	if (!factual) throw new Error("Factuality report was empty");

	return (
		factual
			?.split("\n")
			.map((x) => x.trim())
			.filter((x) => x.length > 0) || []
	);
}

async function summarize(article: SourceArticle) {
	const client = groqClient();
	const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
		{
			role: "system",
			content:
				"Return a normalized summary of the following news articles in a readable point form. Points should not be longer than 100 words. Return in the JSON format following { 'summary': string[] }. Points should be formatted inside an array. Return only one summary.",
		},
		{
			role: "system",
			content: `Outlet: ${article.outlet}\nTitle: ${article?.title}\nBody: ${article?.body_paragraphs}`,
		},
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

	const summaryText = completion.choices[0]?.message.content;
	if (!summaryText) throw new Error("Summary was empty");

	const doc = JSON.parse(summaryText) as Pick<SummarizedArticle, "summary">;
	return doc.summary;
}
