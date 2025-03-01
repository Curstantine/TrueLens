import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';

const repoUrl = "https://github.com/nuuuwan/news_lk3_data.git";
const localRepoPath = path.join(process.cwd(), "news_data");

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

(async function run() {
  await cloneOrUpdateRepo();
  console.log("Repository is up-to-date.");
})();
