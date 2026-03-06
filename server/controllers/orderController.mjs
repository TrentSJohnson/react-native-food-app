import { Order } from '../models/order.mjs';
import { Subscriber } from '../models/subscriber.mjs';
import { User } from '../models/user.mjs';

export async function createOrder(req, res) {
  console.log('[createOrder] POST /orders');
  const { description, locationId } = req.body;
  const clerkId = req.query.clerkId;

  if (!description || !locationId) {
    return res.status(400).json({ error: 'description and locationId are required' });
  }

  const user = await User.findOne({ clerkId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const order = await Order.create({ description, locationId, userId: user._id });
  res.status(201).json({ order });
}

export async function getOrders(req, res) {
  console.log('[getOrders] GET /orders');
  const user = await User.findOne({ clerkId: req.query.clerkId });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const orders = await Order.find({ userId: user._id }).populate('locationId').sort({ createdAt: -1 });
  res.json({ orders });
}

export async function updateOrder(req, res) {
  console.log('[updateOrder] PATCH /orders/:id');
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'description is required' });
  try {
    const user = await User.findOne({ clerkId: req.query.clerkId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      { description },
      { returnDocument: 'after' }
    ).populate('locationId');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    console.error('[updateOrder] error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
}

export async function deleteOrder(req, res) {
  console.log('[deleteOrder] DELETE /orders/:id');
  try {
    const user = await User.findOne({ clerkId: req.query.clerkId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const order = await Order.findOneAndDelete({ _id: req.params.id, userId: user._id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[deleteOrder] error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
}

export async function getFriendOrders(req, res) {
  console.log('[getFriendOrders] GET /orders/friend/:userId');
  const clerkId = req.query.clerkId;
  const { userId: friendUserId } = req.params;

  const me = await User.findOne({ clerkId });
  if (!me) return res.status(404).json({ error: 'User not found' });

  const friendship = await Subscriber.findOne({
    $or: [
      { publisherId: me._id, subscriberId: friendUserId },
      { publisherId: friendUserId, subscriberId: me._id },
    ],
    status: 'accepted',
  });
  if (!friendship) return res.status(403).json({ error: 'Not friends with this user' });

  const orders = await Order.find({ userId: friendUserId }).populate('locationId').sort({ createdAt: -1 });
  res.json({ orders });
}
