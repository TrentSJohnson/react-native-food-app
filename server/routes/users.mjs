import { Router } from 'express';
import { getUsers, upsertUser } from '../controllers/userController.mjs';
import { requireAuth } from '../middleware/requireAuth.mjs';

const router = Router();

router.get('/', requireAuth, getUsers);
router.post('/upsert', requireAuth, upsertUser);

export default router;
