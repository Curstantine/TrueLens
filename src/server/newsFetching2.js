import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoOwner = "nuuuwan";
const repoName = "news_long_lk";
const folderPath = "data/articles"; // Main articles folder
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

async function fetchAndSaveData2() {
  console.log("Fetching and saving data process for newsFetching2 started...");
  const directories = await getDirectoryList();
  if (directories.length === 0) {
    console.error("No article directories found in the repository.");
    return;
  }

  let allData = [];
  for (const dirName of directories) {
    const fileUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${folderPath}/${dirName}/article.json`;
    try {
      const response = await axios.get(fileUrl);

      if (response.status === 200) {
        console.log(`Data for ${dirName} fetched successfully.`);
        allData.push({ id: dirName, data: response.data });
      } else {
        console.error(`Failed to fetch article.json in ${dirName}. HTTP Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching article.json in ${dirName}:`, error.message);
    }
  }

  if (allData.length > 0) {
    fs.writeFileSync(outputFilePath, JSON.stringify(allData, null, 2));
  } else {
    console.error("No data to save.");
  }
  console.log("Fetching and saving data process for newsFetching2 ended.");
}

export { fetchAndSaveData2 };
