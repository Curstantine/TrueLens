import cron from "node-cron";
import { fetchAndSaveData } from "./newsFetching.js";
import { fetchAndSaveData2 } from "./newsFetching2.js";

// Function to run once on startup
(async function runOnStart() {
  console.log("Running initial data fetch...");
  await fetchAndSaveData();
  await fetchAndSaveData2();
  console.log("Initial fetch completed.");
})();

// Schedule it to run every 12 hours
cron.schedule("0 */12 * * *", async () => {
  console.log("Running scheduled data fetch...");
  await fetchAndSaveData();
  await fetchAndSaveData2();
  console.log("Scheduled fetch completed.");
});
