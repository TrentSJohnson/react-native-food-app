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
