import express from 'express';
import { upsertLocation } from '../controllers/locationController.mjs';
import { requireAuth } from '../middleware/requireAuth.mjs';

const router = express.Router();

router.post('/upsert', requireAuth, upsertLocation);

export default router;
