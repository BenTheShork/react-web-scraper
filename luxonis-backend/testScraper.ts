// testScraper.ts
import scrapeSReality from './scraper';

const testScraper = async () => {
  try {
    const ads = await scrapeSReality();
    console.log('Scraped Ads:', ads);
  } catch (error) {
    console.error('Error:', error);
  }
};

testScraper();