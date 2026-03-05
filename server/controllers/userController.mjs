import { getAuth } from '@clerk/express';
import { User } from '../models/user.mjs';

export async function getUsers(_req, res) {
  const users = await User.find({});
  res.json({ users });
}

export async function upsertUser(req, res) {
  const { userId: clerkId } = getAuth(req);
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  const user = await User.findOneAndUpdate(
    { clerkId },
    { clerkId, email },
    { upsert: true, returnDocument: 'after' }
  );

  res.json({ user });
}
