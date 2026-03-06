import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  publisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

subscriberSchema.index({ publisherId: 1, subscriberId: 1 }, { unique: true });

export const Subscriber = mongoose.model('Subscriber', subscriberSchema);
