import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoOwner = "nuuuwan";
const repoName = "news_long_lk";
const folderPath = "data/articles";
const outputFilePath = path.join(__dirname, 'current_data.json');

async function getDirectoryList() {
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`;
  console.log("Fetching article directories from GitHub...");
  try {
    const response = await axios.get(apiUrl);

    if (response.status === 200) {
      console.log("Directories fetched successfully.");
      return response.data
        .filter(item => item.type === "dir") // Only get directories
        .map(item => item.name); // Get directory names
    } else {
      console.error(`Failed to get directory list. HTTP Status: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching directory list:", error.message);
    return [];
  }
}

function loadExistingData() {
  try {
    if (fs.existsSync(outputFilePath)) {
      const fileContent = fs.readFileSync(outputFilePath, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("Error reading existing data file:", error.message);
  }
  return [];
}

async function fetchAndSaveData2() {
  console.log("Fetching and saving data process for newsFetching2 started...");
  
  const existingData = loadExistingData();
  const existingIds = new Set(existingData.map(item => item.id));

  const directories = await getDirectoryList();
  if (directories.length === 0) {
    console.error("No article directories found in the repository.");
    return;
  }

  let newData = [];
  for (const dirName of directories) {
    if (existingIds.has(dirName)) {
      console.log(`Skipping ${dirName}, already stored.`);
      continue; // Skip already stored articles
    }

    const fileUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${folderPath}/${dirName}/article.json`;
    console.log(`Fetching data from ${fileUrl}...`);
    try {
      const response = await axios.get(fileUrl);

      if (response.status === 200) {
        console.log(`Data for ${dirName} fetched successfully.`);
        newData.push({ id: dirName, data: response.data });
      } else {
        console.error(`Failed to fetch article.json in ${dirName}. HTTP Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching article.json in ${dirName}:`, error.message);
    }
  }

  if (newData.length > 0) {
    const combinedData = [...existingData, ...newData];
    fs.writeFileSync(outputFilePath, JSON.stringify(combinedData, null, 2));
    console.log(`Added ${newData.length} new articles. Total stored: ${combinedData.length}`);
  } else {
    console.log("No new data to save.");
  }
  console.log("Fetching and saving data process for newsFetching2 ended.");
}

export { fetchAndSaveData2 }