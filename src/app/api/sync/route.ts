import { stat, copyFile, mkdir, readFile } from "node:fs/promises";
import { join as pathJoin, resolve as pathResolve } from "node:path";
import { spawnSync } from "node:child_process";

import { NextResponse } from "next/server";
import simpleGit from "simple-git";
import type { Groq } from "groq-sdk";

import { isMostlyEnglish, readMetadata } from "~/app/api/sync/utils";
import { db } from "~/server/db";
import { WebScraper } from "~/app/api/sync/web";
import { groqClient } from "~/server/ai";
import { ClusteredArticles, SourceArticle } from "~/app/api/sync/types";

export const runtime = "nodejs";

const repoOwner = "nuuuwan";
const repoName = "news_long_lk";

const sourcePath = pathJoin("news_source_data");
const sourceDataPath = pathJoin(sourcePath, "data");
const targetPath = pathJoin("news_filtered_data");
const clusteredPath = pathJoin("news_filtered_data", "clustered.json");

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

		if (pp.stderr) {
			return NextResponse.json({ status: "error" });
		}
	} catch (error) {
		console.error("Error running grouping.py:", error);
		return NextResponse.json({ status: "error" });
	}

	log("Summarizing articles...");

	try {
		const articles = await readFile(clusteredPath, "utf-8").then(
			(x) => JSON.parse(x) as ClusteredArticles,
		);
		const keys = Object.keys(articles);

		for (const key of keys) {
			const cluster = articles[key as keyof ClusteredArticles];
			if (!cluster) continue;

			await summarize(cluster);

			return;
		}
	} catch (error) {
		console.error("Error summarizing articles:", error);
		return NextResponse.json({ status: "error" });
	}

	// Example usage of WebScraper
	const scraper = new WebScraper();
	const url =
		"https://www.dailymirror.lk/opinion/Beyond-Red-Tape-How-Digitalization-Can-Save-Sri-Lankas-Economy/231-292314";
	const outlet = "Daily Mirror";

	const image = await scraper.scrapeCoverImage(url, outlet);
	console.log("Scraped image URL:", image);

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

async function summarize(articles: SourceArticle[]) {
	const client = groqClient();

	const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
		{
			role: "system",
			content:
				"Return a normalized summary of the following news articles in a readable point form. Points should not be longer than 100 words. Return in the JSON format. Points should be formatted inside an array. Return only one summary.",
		},
	];

	articles.slice(0, 2).forEach((article) => {
		messages.push({
			role: "user",
			content: `Outlet: ${article.outlet}\nTitle: ${article?.title}\nBody: ${article?.body_paragraphs}`,
		});
	});

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

	console.log("Summary:", completion.choices[0]?.message.content);
}
