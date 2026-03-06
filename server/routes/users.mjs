import { Router } from 'express';
import { getMe, getUsers, searchUsers, upsertUser } from '../controllers/userController.mjs';
import { requireAuth } from '../middleware/requireAuth.mjs';

const router = Router();

router.get('/', requireAuth, getUsers);
router.post('/upsert', requireAuth, upsertUser);
router.get('/me', requireAuth, getMe);
router.get('/search', requireAuth, searchUsers);

export default router;
