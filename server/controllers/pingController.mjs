import mongoose from 'mongoose';

export function ping(_req, res) {
  console.log('[ping] GET /ping');
  res.json({ message: 'pong' });
}

export async function pingDb(_req, res) {
  console.log('[pingDb] GET /ping/db');
  try {
    await mongoose.connection.db.admin().command({ ping: 1 });
    res.json({ status: 'ok', message: 'MongoDB Atlas is reachable' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
}
