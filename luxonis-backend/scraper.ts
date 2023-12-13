import puppeteer from 'puppeteer';
import { Pool } from 'pg';

export interface Ad {
  title: string;
  imageUrl: string;
}

const pool = new Pool({
  user: 'postgres',
  host: 'database',
  database: 'luxonisdb',
  password: '007prosperanova',
  port: 5432,
});

const createAdsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        imageUrl VARCHAR(255)
      );
    `);
  } catch (error) {
    console.error('Error creating table "ads":', error);
  }
};

const getTotalRowsInDatabase = async (): Promise<number> => {
  try {
    await createAdsTable();
    const result = await pool.query('SELECT COUNT(*) FROM ads');
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error querying PostgreSQL:', error);
    return 0;
  }
};

const scrapeSReality = async (): Promise<Ad[]> => {
  const totalRowsInDatabase = await getTotalRowsInDatabase();
  const desiredTotalRows = 500;

  if (totalRowsInDatabase >= desiredTotalRows) {
    
    try {
      const result = await pool.query('SELECT * FROM ads LIMIT $1', [desiredTotalRows]);
      return result.rows;
    } catch (error) {
      console.error('Error querying PostgreSQL:', error);
      return [];
    }
  }
  else if(totalRowsInDatabase <= desiredTotalRows) {
    
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const ads: Ad[] = [];
  const totalPages = 35;

  for (let currentPage = 1; ads.length < desiredTotalRows; currentPage++) {
    const url = `https://www.sreality.cz/en/search/for-sale/apartments?page=${currentPage}`;
    
    await page.goto(url);

    const adElements = await page.$$('.property.ng-scope');

    for (const adElement of adElements) {
      const titleElement = await adElement.$('.name');
      const title = titleElement ? await titleElement.evaluate((node) => node.textContent?.trim() || '') : '';

      const imageElement = await adElement.$('img');
      const imageUrl = imageElement ? await imageElement.evaluate((node) => node.getAttribute('src') || '') : '';

      ads.push({ title, imageUrl });
    }
    
  }

  const insertPromises = ads.map(ad =>
    pool.query('INSERT INTO ads(title, imageUrl) VALUES($1, $2)', [ad.title, ad.imageUrl])
  );

  try {
    await Promise.all(insertPromises);
    
  } catch (error) {
    console.error('Error saving to PostgreSQL:', error);
  } finally {
    await browser.close();
  }
  
  let result = await pool.query('SELECT * FROM ads LIMIT $1', [desiredTotalRows]);
  return result.rows;
  
}
  return [];
};

export default scrapeSReality;
