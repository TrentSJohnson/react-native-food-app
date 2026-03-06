import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { clerkInit } from './middleware/requireAuth.mjs';
import locationRoutes from './routes/locations.mjs';
import orderRoutes from './routes/orders.mjs';
import pingRoutes from './routes/ping.mjs';
import subscriberRoutes from './routes/subscribers.mjs';
import userRoutes from './routes/users.mjs';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use(clerkInit);

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

app.use('/ping', pingRoutes);
app.use('/users', userRoutes);
app.use('/locations', locationRoutes);
app.use('/orders', orderRoutes);
app.use('/subscribers', subscriberRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
