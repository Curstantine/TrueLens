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

  // Extract FT.lk and Daily Mirror links from the JSON data
  public extractLinks() {
    const jsonData = this.readJsonData();
    const ftLinks: string[] = [];
    const dailyMirrorLinks: string[] = [];

    // Loop through each cluster to extract article URLs
    for (const clusterId in jsonData) {
      const articles = jsonData[clusterId];
      for (const article of articles) {
        if (article.outlet === 'ft.lk') {
          ftLinks.push(article.url);
        } else if (article.outlet === 'Daily Mirror') {
          dailyMirrorLinks.push(article.url);
        }
      }
    }

    return { ftLinks, dailyMirrorLinks };
  }

  // Function to scrape images from a URL
  public async scrapeImages(url: string) {
    try {
      const resp = await fetch(url);
      const data = await resp.text();
      const $ = cheerio.load(data);

      // Default logic for scraping images (change selectors as needed for each site)
      let newsImage: string | null = null;

      // Scrape from FT.lk
      if (url.includes('ft.lk')) {
        newsImage = $("div.article-content img").first().attr("src");
      }
      // Scrape from Daily Mirror
      else if (url.includes('dailymirror.lk')) {
        newsImage = $("p > img").first().attr("src");
      }

      return newsImage;
    } catch (error) {
      console.error("Error fetching the URL:", error);
      return null;
    }
  }

  // Scrape images from FT.lk first, then Daily Mirror links with 5 seconds delay
  public async scrapeAllImages() {
    const { ftLinks, dailyMirrorLinks } = this.extractLinks();

    // Prioritize FT.lk links first, followed by Daily Mirror links
    const allLinks = [...ftLinks, ...dailyMirrorLinks]; // FT.lk first, then Daily Mirror links
    const imagesData: { link: string, image: string }[] = [];

    for (const link of allLinks) {
      // Wait for 5 seconds before scraping the next link

      await sleep(5000);  // 5 seconds delay

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