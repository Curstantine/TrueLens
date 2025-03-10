import { stat, copyFile, mkdir } from "node:fs/promises";
import { join as pathJoin, resolve as pathReslove } from "node:path";
import { spawnSync } from "node:child_process";

import { NextResponse } from "next/server";
import simpleGit from "simple-git";

import { isMostlyEnglish, readMetadata } from "~/app/api/sync/utils";
import { db } from "~/server/db";

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
		const file = pathReslove("./src/app/api/sync/grouping.py");

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

		return NextResponse.json({ status: "ok" });
	}

	log("Cloning repository...");
	await git.clone(`https://github.com/${repoOwner}/${repoName}.git`, sourcePath, {
		"--depth": 1,
	});

	log("Repository cloned successfully!");
}
