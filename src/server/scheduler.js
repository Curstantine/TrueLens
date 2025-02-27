import cron from "node-cron";
import { fetchAndSaveData } from "./newsFetching.js"; // Corrected named import

// Function to run once on startup
(async function runOnStart() {
  console.log("Running initial data fetch...");
  await fetchAndSaveData();
  console.log("Initial fetch completed.");
})();

// Schedule it to run every 12 hours
cron.schedule("0 */12 * * *", async () => {
  console.log("Running scheduled data fetch...");
  await fetchAndSaveData();
  console.log("Scheduled fetch completed.");
});
