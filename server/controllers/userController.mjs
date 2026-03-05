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
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
}

export async function checkUsername(req, res) {
  console.log('[checkUsername] GET /users/check-username/:username');
  const { username } = req.params;
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  const existing = await User.findOne({ username: username.toLowerCase() });
  res.json({ available: !existing });
}

export async function updateUsername(req, res) {
  console.log('[updateUsername] PATCH /users/username');
  const { userId: clerkId } = getAuth(req);
  const { username } = req.body;
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  const taken = await User.findOne({ username: username.toLowerCase(), clerkId: { $ne: clerkId } });
  if (taken) {
    return res.status(409).json({ error: 'Username is already taken' });
  }

  const user = await User.findOneAndUpdate(
    { clerkId },
    { $set: { username: username.toLowerCase() } },
    { returnDocument: 'after' }
  );

  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
}
