import { getAuth } from '@clerk/express';
import { Subscriber } from '../models/subscriber.mjs';
import { User } from '../models/user.mjs';

// POST /subscribers/request/:targetUserId
// Send a friend request to another user (current user = subscriber, target = publisher)
export async function sendFriendRequest(req, res) {
  const { userId: clerkId } = getAuth(req);
  const { targetUserId } = req.params;

  const me = await User.findOne({ clerkId });
  if (!me) return res.status(404).json({ error: `User not found ${clerkId}` });

  const target = await User.findById(targetUserId);
  if (!target) return res.status(404).json({ error: 'Target user not found' });

  if (me._id.equals(target._id)) {
    return res.status(400).json({ error: 'Cannot send friend request to yourself' });
  }

  const existing = await Subscriber.findOne({
    publisherId: target._id,
    subscriberId: me._id,
  });
  if (existing) {
    return res.status(409).json({ error: 'Friend request already exists', status: existing.status });
  }

  const request = await Subscriber.create({
    publisherId: target._id,
    subscriberId: me._id,
  });

  res.status(201).json({ request });
}

// GET /subscribers/requests/received
// Get pending friend requests received by current user
export async function getReceivedRequests(req, res) {
  const { userId: clerkId } = getAuth(req);
  const me = await User.findOne({ clerkId });
  if (!me) return res.status(404).json({ error: 'User not found' });

  const requests = await Subscriber.find({ publisherId: me._id, status: 'pending' })
    .populate('subscriberId', 'username email');

  res.json({ requests });
}

// GET /subscribers/requests/sent
// Get pending friend requests sent by current user
export async function getSentRequests(req, res) {
  const { userId: clerkId } = getAuth(req);
  const me = await User.findOne({ clerkId });
  if (!me) return res.status(404).json({ error: 'User not found' });

  const requests = await Subscriber.find({ subscriberId: me._id, status: 'pending' })
    .populate('publisherId', 'username email');

  res.json({ requests });
}

// PATCH /subscribers/requests/:requestId/accept
// Accept a received friend request
export async function acceptRequest(req, res) {
  const { userId: clerkId } = getAuth(req);
  const me = await User.findOne({ clerkId });
  if (!me) return res.status(404).json({ error: 'User not found' });

  const request = await Subscriber.findOne({ _id: req.params.requestId, publisherId: me._id });
  if (!request) return res.status(404).json({ error: 'Request not found' });

  request.status = 'accepted';
  await request.save();

  res.json({ request });
}

// DELETE /subscribers/requests/:requestId
// Reject a received request OR cancel a sent request
export async function deleteRequest(req, res) {
  const { userId: clerkId } = getAuth(req);
  const me = await User.findOne({ clerkId });
  if (!me) return res.status(404).json({ error: 'User not found' });

  const request = await Subscriber.findOneAndDelete({
    _id: req.params.requestId,
    $or: [{ publisherId: me._id }, { subscriberId: me._id }],
  });

  if (!request) return res.status(404).json({ error: 'Request not found' });
  res.json({ success: true });
}
