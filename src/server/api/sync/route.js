import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';

// Git settings
const repoUrl = "https://github.com/nuuuwan/news_lk3_data.git";
const localRepoPath = path.join(process.cwd(), "news_data");
const articlesPath = path.join(localRepoPath, "articles");
const outputFilePath = path.join(localRepoPath, "filtered_articles.json");

const git = simpleGit();

async function cloneOrUpdateRepo() {
  if (!fs.existsSync(localRepoPath)) {
    console.log("Cloning repository...");
    await git.clone(repoUrl, localRepoPath, ["--depth", "1"]); // Shallow clone for speed
  } else {
    console.log("Pulling latest changes...");
    await git.cwd(localRepoPath).pull("origin", "main");
  }
}

// Check if a string is mostly English (at least 90% ASCII characters)
function isMostlyEnglish(text) {
  if (!text) return false;
  const asciiChars = text.split("").filter(char => char.charCodeAt(0) < 128);
  return (asciiChars.length / text.length) > 0.9; // 90% ASCII
}

function filterEnglishArticles(article) {
  return article.original_lang === "en" || isMostlyEnglish(article.original_title);
}

async function filterArticles() {
  if (!fs.existsSync(articlesPath)) {
    console.error("Articles directory not found!");
    return;
  }

  const allFiles = fs.readdirSync(articlesPath);
  let englishArticles = [];

  for (const file of allFiles) {
    if (!file.endsWith(".json")) continue; // Only process JSON files

    const filePath = path.join(articlesPath, file);
    try {
      const articleData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (filterEnglishArticles(articleData)) {
        englishArticles.push(articleData);
      }
    } catch (error) {
      console.error(`Error parsing ${file}: ${error.message}`);
    }
  }

  // Save filtered articles
  fs.writeFileSync(outputFilePath, JSON.stringify(englishArticles, null, 2));
  console.log(`Filtered ${englishArticles.length} English articles.`);
}

// Execute both steps
(async function run() {
  try {
    await cloneOrUpdateRepo();  // Step 1: Clone/Update Repo
    await filterArticles();     // Step 2: Filter English Articles
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
