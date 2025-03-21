import scrapFavicon from 'scrap-favicon';

const websites: { [key: string]: string } = {
  'ft.lk': 'Daily FT',
  'newsfirst.lk': 'News First',
  'dailymirror.lk': 'Daily Mirror',
  'sundaytimes.lk': 'Sunday Times',
  'dbsjeyaraj.com': 'DBS Jeyaraj',
  'newswire.lk': 'Newswire',
  'news.lk': 'News.lk',
  'adaderana.lk': 'Ada Derana',
  'dailynews.lk': 'Daily News',
  'srilankamirror.com': 'Sri Lanka Mirror',
  'colombotelegraph.com': 'Colombo Telegraph',
};

async function fetchFavicon(url: string): Promise<string | null> {
  try {
    const result = await scrapFavicon(url);
    if (result.icons.length > 0) {
      return result.icons[0].src;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch favicon for ${url}:`, error);
    return null;
  }
}

async function fetchFavicons() {
  for (const [domain, name] of Object.entries(websites)) {
    const url = `https://${domain}`;
    const favicon = await fetchFavicon(url);
    if (favicon) {
      console.log(`${name} (${url}): ${favicon}`);
    } else {
      console.log(`${name} (${url}): Favicon not found`);
    }
  }
}

fetchFavicons();