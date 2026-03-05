import express from 'express';
import { createOrder, getOrders } from '../controllers/orderController.mjs';
import { requireAuth } from '../middleware/requireAuth.mjs';

const router = express.Router();

router.get('/', requireAuth, getOrders);
router.post('/', requireAuth, createOrder);

export default router;
