// backend/server.js
import express from 'express';
import cors from 'cors';
import gplay from 'google-play-scraper';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    const results = await gplay.search({
      term: query,
      num: 10,
      country: 'id',
      language: 'id'
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tambahan endpoint untuk mendapatkan detail aplikasi
app.get('/api/app/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await gplay.app({ appId: id });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tambahan endpoint untuk mendapatkan reviews
app.get('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await gplay.reviews({
      appId: id,
      sort: gplay.sort.NEWEST,
      num: 100
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});