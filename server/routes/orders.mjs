import express from 'express';
import { createOrder, deleteOrder, getOrders, updateOrder } from '../controllers/orderController.mjs';
import { requireAuth } from '../middleware/requireAuth.mjs';

const router = express.Router();

router.get('/', requireAuth, getOrders);
router.post('/', requireAuth, createOrder);
router.patch('/:id', requireAuth, updateOrder);
router.delete('/:id', requireAuth, deleteOrder);

export default router;
