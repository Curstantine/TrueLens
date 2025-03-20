// webScraper.ts
import fs from 'fs';
import * as cheerio from 'cheerio';

// Function to pause execution for a specified amount of time (in milliseconds)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class WebScraper {
  private jsonFilePath: string;

  constructor(jsonFilePath: string) {
    this.jsonFilePath = jsonFilePath;
  }

  // Read and return the JSON data
  private readJsonData() {
    if (!fs.existsSync(this.jsonFilePath)) {
      console.error(`File not found: ${this.jsonFilePath}`);
      process.exit(1);  // Exit if file doesn't exist
    }

    return JSON.parse(fs.readFileSync(this.jsonFilePath, 'utf-8'));
  }

  // Extract Daily Mirror links from the JSON data
  public extractDailyMirrorLinks() {
    const jsonData = this.readJsonData();
    const dailyMirrorLinks: string[] = [];
    
    // Loop through each cluster to extract the article URLs from Daily Mirror
    for (const clusterId in jsonData) {
      const articles = jsonData[clusterId];
      for (const article of articles) {
        if (article.outlet === 'Daily Mirror') {
          dailyMirrorLinks.push(article.url);
        }
      }
    }

    return dailyMirrorLinks;
  }

  // Function to scrape images from a URL
  public async scrapeImages(url: string) {
    try {
      const resp = await fetch(url);
      const data = await resp.text();
      const $ = cheerio.load(data);

      const newsImage = $("p > img").first().attr("src");
      return newsImage;
    } catch (error) {
      console.error("Error fetching the URL:", error);
      return null;
    }
  }

  // Scrape images from all Daily Mirror links
  public async scrapeAllImages() {
    const dailyMirrorLinks = this.extractDailyMirrorLinks();
    const imagesData: string[] = [];

    for (const link of dailyMirrorLinks) {
      const image = await this.scrapeImages(link);
      if (image) {
        imagesData.push({ link, image });
        console.log(`Scraped image from ${link}: ${image}`);
      } else {
        console.log(`No image found for ${link}`);
      }
    }

    return imagesData;  // Return scraped image URLs
  }
}
