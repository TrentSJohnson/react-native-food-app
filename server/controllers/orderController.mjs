import { Order } from '../models/order.mjs';

export async function createOrder(req, res) {
  console.log('[createOrder] POST /orders');
  const { description, locationId } = req.body;
  const userId = req.query.clerkId;

  if (!description || !locationId) {
    return res.status(400).json({ error: 'description and locationId are required' });
  }

  const order = await Order.create({ description, locationId, userId });
  res.status(201).json({ order });
}

export async function getOrders(req, res) {
  console.log('[getOrders] GET /orders');
  const userId = req.query.clerkId;
  const orders = await Order.find({ userId }).populate('locationId').sort({ createdAt: -1 });
  res.json({ orders });
}

export async function updateOrder(req, res) {
  console.log('[updateOrder] PATCH /orders/:id');
  const userId = req.query.clerkId;
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'description is required' });
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId },
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
  const userId = req.query.clerkId;
  try {
    const order = await Order.findOneAndDelete({ _id: req.params.id, userId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[deleteOrder] error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
}
