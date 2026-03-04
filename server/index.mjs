import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.get('/ping/db', async (req, res) => {
  if (!MONGODB_URI) {
    return res.status(500).json({ status: 'error', message: 'MONGODB_URI not set' });
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    res.json({ status: 'ok', message: 'MongoDB Atlas is reachable' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
