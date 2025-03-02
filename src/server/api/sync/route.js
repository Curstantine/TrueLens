import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";

const repoUrl = "https://github.com/nuuuwan/news_lk3_data.git";
const localRepoPath = path.join(process.cwd(), "news_data");
const articlesDirs = ["articles", "ext_articles"];
const outputFilePath = path.join(localRepoPath, "filtered_articles.json");

const git = simpleGit();

async function cloneOrUpdateRepo() {
  if (!(await exists(localRepoPath))) {
    console.log("Cloning repository...");
    await git.clone(repoUrl, localRepoPath, ["--depth", "1"]); // Shallow clone for speed
  } else {
    console.log("Pulling latest changes...");
    await git.cwd(localRepoPath).pull("origin", "main");
  }
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isMostlyEnglish(text) {
  if (!text) return false;
  const asciiChars = [...text].filter(char => char.charCodeAt(0) < 128);
  return (asciiChars.length / text.length) > 0.9; // 90% ASCII
}

function filterEnglishArticles(article) {
  return article.original_lang === "en" || isMostlyEnglish(article.original_title);
}

async function filterArticles() {
  let englishArticles = [];

  for (const dir of articlesDirs) {
    const dirPath = path.join(localRepoPath, dir);
    if (!(await exists(dirPath))) {
      console.warn(`Warning: ${dirPath} not found! Skipping...`);
      continue;
    }

    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter(file => file.endsWith(".json"));

    const filePromises = jsonFiles.map(async (file) => {
      const filePath = path.join(dirPath, file);
      try {
        const data = JSON.parse(await fs.readFile(filePath, "utf-8"));
        if (filterEnglishArticles(data)) return data;
      } catch (error) {
      }
      return null;
    });

    const results = await Promise.all(filePromises);
    englishArticles.push(...results.filter(Boolean));
  }

  // Save filtered articles
  await fs.writeFile(outputFilePath, JSON.stringify(englishArticles, null, 2));
  console.log(`Filtered ${englishArticles.length} English articles.`);
}

// Execute script
(async function run() {
  try {
    await cloneOrUpdateRepo(); // Step 1: Clone/Update Repo
    await filterArticles();    // Step 2: Filter English Articles
  } catch (error) {
    console.error("Error:", error);
  }
})();
