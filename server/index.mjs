import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

app.get('/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

app.get('/ping/db', async (_req, res) => {
  try {
    await mongoose.connection.db.admin().command({ ping: 1 });
    res.json({ status: 'ok', message: 'MongoDB Atlas is reachable' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

app.post('/users/upsert', async (req, res) => {
  const { clerkId, email } = req.body;
  if (!clerkId || !email) {
    return res.status(400).json({ error: 'clerkId and email are required' });
  }

  const user = await User.findOneAndUpdate(
    { clerkId },
    { clerkId, email },
    { upsert: true, new: true }
  );

  res.json({ user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
