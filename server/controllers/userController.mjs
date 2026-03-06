import { getAuth } from '@clerk/express';
import { User } from '../models/user.mjs';

export async function getUsers(_req, res) {
  console.log('[getUsers] GET /users');
  const users = await User.find({});
  res.json({ users });
}

export async function upsertUser(req, res) {
  console.log('[upsertUser] POST /users/upsert');
  const { userId: clerkId } = getAuth(req);
  const { email, username } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  const update = { clerkId, email };
  if (username) update.username = username;

  const user = await User.findOneAndUpdate(
    { clerkId },
    { $set: update },
    { upsert: true, returnDocument: 'after' }
  );

  res.json({ user });
}

export async function getMe(req, res) {
  console.log('[getMe] GET /users/me');
  const { userId: clerkId } = getAuth(req);
  const user = await User.findOne({ clerkId });
  if (!user) return res.status(404).json({ error: `User not found ${clerkId}` });
  res.json({ user });
}

export async function searchUsers(req, res) {
  console.log('[searchUsers] GET /users/search');
  const { userId: clerkId } = getAuth(req);
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }
  const users = await User.find(
    { username: { $regex: q.toLowerCase(), $options: 'i' } }).limit(20);
  res.json({ users });
}
