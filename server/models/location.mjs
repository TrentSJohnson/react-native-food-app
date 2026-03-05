import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  googlePlaceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String },
  rating: { type: Number },
  priceLevel: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Location = mongoose.model('Location', locationSchema);
