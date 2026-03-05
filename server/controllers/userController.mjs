import { User } from '../models/user.mjs';

export async function getUsers(_req, res) {
  const users = await User.find({});
  res.json({ users });
}

export async function upsertUser(req, res) {
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
}
