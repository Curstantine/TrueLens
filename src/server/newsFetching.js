import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const repoOwner = "nuuuwan";
const repoName = "news_lk3_data";
const folderPath = "articles";
const outputFilePath = path.join(__dirname, 'local_data.json');

async function getFileList() {
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`;
  console.log("Fetching file list from GitHub...");
  try {
    const response = await axios.get(apiUrl);

    if (response.status === 200) {
      console.log("File list fetched successfully.");
      return response.data
        .filter(file => file.name.endsWith(".json"))
        .map(file => file.name);
    } else {
      console.error(`Failed to get file list. HTTP Status: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching file list:", error.message);
    return [];
  }
}

async function fetchAndSaveData() {
  console.log("Fetching and saving data process started...");
  const filenames = await getFileList();
  if (filenames.length === 0) {
    console.error("No JSON files found in the repository.");
    return;
  }

  let allData = [];
  const baseUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${folderPath}/`;

  for (const filename of filenames) {
    const fileUrl = `${baseUrl}${filename}`;
    try {
      const response = await axios.get(fileUrl);

      if (response.status === 200) {
        console.log(`Data for ${filename} fetched successfully.`);
        allData.push({ filename, data: response.data });
      } else {
        console.error(`Failed to fetch ${filename}. HTTP Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching ${filename}:`, error.message);
    }
  }

  if (allData.length > 0) {
    fs.writeFileSync(outputFilePath, JSON.stringify(allData, null, 2));
  } else {
    console.error("No data to save.");
  }
  console.log("Fetching and saving data process ended.");
}

export { fetchAndSaveData };
