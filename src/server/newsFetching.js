import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';

// Git settings
const repoUrl = "https://github.com/nuuuwan/news_lk3_data.git";
const localRepoPath = path.join(process.cwd(), "news_data");
const articlesPath = path.join(localRepoPath, "data/articles");

const git = simpleGit();

async function cloneOrUpdateRepo() {
  if (!fs.existsSync(localRepoPath)) {
    console.log("Cloning repository...");
    await git.clone(repoUrl, localRepoPath);
  } else {
    console.log("Pulling latest changes...");
    await git.cwd(localRepoPath).pull();
  }
}

// ✅ STEP 2: Filter English Articles
function isEnglish(text) {
  return /^[\x00-\x7F]+$/.test(text); // Check if title is ASCII (English)
}

function filterEnglishArticles(articles) {
  return articles.filter(article => 
    article.original_lang === "en" || isEnglish(article.original_title)
  );
}

async function filterArticles() {
  if (!fs.existsSync(articlesPath)) {
    console.error("Articles directory not found!");
    return;
  }

  const allFiles = fs.readdirSync(articlesPath);
  let englishArticles = [];

  for (const file of allFiles) {
    if (!file.endsWith(".json")) continue; // Ensure only JSON files are processed

    const filePath = path.join(articlesPath, file);
    const articleData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (filterEnglishArticles([articleData]).length > 0) {
      englishArticles.push(articleData);
    }
  }

  // Save filtered articles
  fs.writeFileSync("filtered_articles.json", JSON.stringify(englishArticles, null, 2));
  console.log(`✅ Filtered ${englishArticles.length} English articles.`);
}

// Execute both steps
(async function run() {
  await cloneOrUpdateRepo();  // Step 1: Clone/Update Repo
  await filterArticles();     // Step 2: Filter English Articles
})();
