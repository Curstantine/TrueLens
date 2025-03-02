import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";

const repoUrl = "https://github.com/nuuuwan/news_lk3_data.git";
const localRepoPath = path.join(process.cwd(), "news_data");
const articlesDirs = ["articles", "ext_articles"];
const outputFilePath = path.join(localRepoPath, "filtered_articles.json");

const git = simpleGit();

// Check if a file or directory exists
async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Clone or update the Git repository
async function cloneOrUpdateRepo() {
  if (!(await exists(localRepoPath))) {
    console.log("Cloning repository...");
    await git.clone(repoUrl, localRepoPath, ["--depth", "1"]); // Shallow clone for speed
  } else {
    console.log("Pulling latest changes...");
    await git.cwd(localRepoPath).pull("origin", "main");
  }
}

//  Detect if a text is mostly English (at least 90% ASCII)
function isMostlyEnglish(text) {
  if (!text) return false;
  const asciiChars = [...text].filter((char) => char.charCodeAt(0) < 128);
  return (asciiChars.length / text.length) > 0.9;
}

//  Filter function to check if an article is in English
function filterEnglishArticles(article) {
  return article.original_lang === "en" || isMostlyEnglish(article.original_title);
}

//  Process articles directory one by one to avoid memory overload
async function filterArticles() {
  let englishArticles = [];

  for (const dir of articlesDirs) {
    const dirPath = path.join(localRepoPath, dir);
    if (!(await exists(dirPath))) {
      console.warn(` Warning: ${dirPath} not found! Skipping...`);
      continue;
    }

    console.log(` Processing directory: ${dirPath}`);
    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    for (const file of jsonFiles) {
      const filePath = path.join(dirPath, file);
      try {
        const data = await fs.readFile(filePath, "utf-8");
        const article = JSON.parse(data);

        if (filterEnglishArticles(article)) {
          englishArticles.push(article);
        }
      } catch (error) {
        console.error(` Error parsing ${file}: ${error.message}`);
      }
    }
  }

  // Save filtered articles
  await fs.writeFile(outputFilePath, JSON.stringify(englishArticles, null, 2));
  console.log(` Filtered ${englishArticles.length} English articles.`);
}

// Run the full process
(async function run() {
  try {
    await cloneOrUpdateRepo(); // Step 1: Clone/Update Repo
    await filterArticles(); // Step 2: Filter English Articles
  } catch (error) {
    console.error(" Error:", error.message);
  }
})();
