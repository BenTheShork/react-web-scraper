// luxonis-backend/server.ts
import express from 'express';
import cors from 'cors';
import scrapeSReality from './scraper';

const app = express();
const port = 3001; // Choose a port for your server

app.use(cors());

app.get('/api/scrape', async (req: express.Request, res: express.Response) => {
  try {
    const ads = await scrapeSReality();
    
    res.json(ads);
  } catch (error) {
    console.error('Error in API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
