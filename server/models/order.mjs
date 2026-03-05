import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  description: { type: String, required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  userId: { type: String, required: true }, // Clerk user ID
  createdAt: { type: Date, default: Date.now },
});

export const Order = mongoose.model('Order', orderSchema);
