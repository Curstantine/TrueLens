//node ./src/server/api/sync/Filterarticle.js
import fs from 'fs/promises';
import path from 'path';

const localRepoPath = path.join('newsStore_data');
const folderPath = path.join(localRepoPath, 'data/articles');
const outputFilePath = path.join(localRepoPath, 'filtered_articles.json');

//  Check if text is mostly English (at least 90% ASCII)
function isMostlyEnglish(text) {
  if (!text) return false;
  // Filter out non-ASCII characters
  const asciiChars = [...text].filter((char) => char.charCodeAt(0) < 128);
  return (asciiChars.length / text.length) > 0.9;
}

//  Filter function for English articles
function filterEnglishArticles(article) {
  // Check title and body for English content
  const isTitleEnglish = article.title && isMostlyEnglish(article.title);
  const isBodyEnglish = article.body_paragraphs && article.body_paragraphs.every(paragraph => isMostlyEnglish(paragraph));

  // We want to allow articles with English titles or mostly English body content
  return isTitleEnglish || isBodyEnglish;
}

//  Load JSON file safely
async function loadJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(` Error reading ${filePath}:`, error.message);
    return null;
  }
}

//  Save JSON file safely
async function saveJSON(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(` Error saving file ${filePath}:`, error);
  }
}

//  Filter and save English articles
export async function filterArticles() {
  // Load existing filtered articles to avoid duplication
  let existingArticles = [];
  try {
    existingArticles = await loadJSON(outputFilePath) || [];
  } catch (error) {
    // Ignore error if file doesn't exist, we'll just start with an empty array
  }

  // Get a list of all subfolders (i.e., article directories)
  const subfolders = await fs.readdir(folderPath, { withFileTypes: true });
  const directories = subfolders.filter(dir => dir.isDirectory()).map(dir => dir.name);

  let englishArticles = [];

  // Process each folder in the articles directory
  for (const dirName of directories) {
    const articleFilePath = path.join(folderPath, dirName, 'article.json');

    try {
      const article = await loadJSON(articleFilePath);

      if (article && filterEnglishArticles(article)) {
        // Add to the list only if it's not already in the existing articles
        if (!existingArticles.some(existingArticle => existingArticle.title === article.title)) {
          englishArticles.push(article);
        }
      }
    } catch (error) {
      // Ignore errors related to individual articles
    }
  }

  // Combine existing articles with the new ones
  const allArticles = [...existingArticles, ...englishArticles];

  // Save the filtered English articles to a new file
  if (allArticles.length > 0) {
    await saveJSON(outputFilePath, allArticles);
  }
}

// Call the filterArticles function
filterArticles().catch(error => console.error('Error filtering articles:', error));
