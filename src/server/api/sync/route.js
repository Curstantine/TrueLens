//node ./src/server/api/sync/route.js
import fs from 'fs';
import path from 'path';
import https from 'https';
import simpleGit from 'simple-git';

const repoOwner = 'nuuuwan';
const repoName = 'news_long_lk';
const folderPath = 'data/articles';
const outputFilePath = path.join('current_data.json');
const localRepoPath = path.join( 'newsStore_data');

const git = simpleGit();

// Clone or update the Git repository
async function cloneOrUpdateRepo() {
  if (!fs.existsSync(localRepoPath)) {
    console.log('Cloning repository...');
    await git.clone(`https://github.com/${repoOwner}/${repoName}.git`, localRepoPath);
  } else {
    console.log('Pulling latest changes...');
    await git.cwd(localRepoPath).pull('origin', 'main');
  }
}

// Check if text is mostly English (at least 90% ASCII)
function isMostlyEnglish(text) {
  if (!text) return false;
  const asciiChars = [...text].filter((char) => char.charCodeAt(0) < 128);
  return (asciiChars.length / text.length) > 0.9;
}

// Filter function for English articles
function filterEnglishArticles(article) {
  return (
    article.original_lang === 'en' ||
    (article.original_title && isMostlyEnglish(article.original_title))
  );
}

// Fetch JSON data from the given URL using https
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject('Error parsing JSON');
        }
      });

    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Get list of article directories from the GitHub repository
async function getDirectoryList() {
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`;
  try {
    const data = await fetchJSON(apiUrl);
    return data.filter(item => item.type === 'dir').map(item => item.name);
  } catch (error) {
    console.error('Error fetching directory list:', error);
    return [];
  }
}

// Load existing data from the output file
function loadExistingData() {
  try {
    if (fs.existsSync(outputFilePath)) {
      const fileContent = fs.readFileSync(outputFilePath, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Error reading existing data file:', error.message);
  }
  return [];
}

// Fetch and save filtered English articles
async function fetchAndSaveData() {
  console.log('Fetching and saving data process started...');

  // Clone or update the repo
  await cloneOrUpdateRepo();

  // Load existing data
  const existingData = loadExistingData();
  const existingIds = new Set(existingData.map(item => item.id));

  // Get list of directories
  const directories = await getDirectoryList();
  if (directories.length === 0) {
    console.error('No article directories found in the repository.');
    return;
  }

  let newData = [];
  for (const dirName of directories) {
    if (existingIds.has(dirName)) {
      console.log(`Skipping ${dirName}, already stored.`);
      continue;
    }

    const fileUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${folderPath}/${dirName}/article.json`;
    console.log(`Fetching data from ${fileUrl}...`);
    try {
      const article = await fetchJSON(fileUrl);

      if (filterEnglishArticles(article)) {
        newData.push({ id: dirName, data: article });
      }
    } catch (error) {
      console.error(`Error fetching article.json in ${dirName}:`, error.message);
    }
  }

  // Save the new data if found
  if (newData.length > 0) {
    const combinedData = [...existingData, ...newData];
    fs.writeFileSync(outputFilePath, JSON.stringify(combinedData, null, 2));
    console.log(`Added ${newData.length} new articles. Total stored: ${combinedData.length}`);
  } else {
    console.log('No new English articles found to save.');
  }

  console.log('Fetching and saving data process ended.');
}

// Run the script
fetchAndSaveData().catch((error) => console.error('Error in fetching and saving data:', error));
