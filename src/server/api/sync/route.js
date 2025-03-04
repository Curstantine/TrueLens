import fs from 'fs/promises';
import path from 'path';
import simpleGit from 'simple-git';

const repoOwner = 'nuuuwan';
const repoName = 'news_long_lk';
const localRepoPath = path.join('newsStore_data');

const git = simpleGit(); // No need to enable or disable logs

//  Check if directory exists
async function directoryExists(dirPath) {
  try {
    await fs.access(dirPath);
    return true;
  } catch {
    return false;
  }
}

//  Clone or update the Git repository
export async function cloneOrUpdateRepo() {
  if (!(await directoryExists(localRepoPath))) {
    console.log(' Cloning repository...');
    try {
      await git.clone(`https://github.com/${repoOwner}/${repoName}.git`, localRepoPath);
      console.log('Repository cloned successfully!');
    } catch (error) {
      console.error('Error while cloning the repository:', error);
    }
  } else {
    console.log(' Pulling latest changes...');
    try {
      await git.cwd(localRepoPath).pull('origin', 'main');
      console.log('Repository updated successfully!');
    } catch (error) {
      console.error('Error while pulling updates:', error);
    }
  }
}

// Run the cloning or updating process
cloneOrUpdateRepo().catch((error) => console.error('Error in repo operation:', error));
