import { getAuth } from '@clerk/express';
import { Order } from '../models/order.mjs';

export async function createOrder(req, res) {
  console.log('[createOrder] POST /orders');
  const { description, locationId } = req.body;
  const { userId } = getAuth(req);

  if (!description || !locationId) {
    return res.status(400).json({ error: 'description and locationId are required' });
  }

  const order = await Order.create({ description, locationId, userId });
  res.status(201).json({ order });
}

export async function getOrders(req, res) {
  console.log('[getOrders] GET /orders');
  const { userId } = getAuth(req);
  const orders = await Order.find({ userId }).populate('locationId').sort({ createdAt: -1 });
  res.json({ orders });
}
