import { Router } from 'express';
import { checkUsername, getMe, getUsers, updateUsername, upsertUser } from '../controllers/userController.mjs';
import { requireAuth } from '../middleware/requireAuth.mjs';

const router = Router();

router.get('/', requireAuth, getUsers);
router.post('/upsert', requireAuth, upsertUser);
router.get('/me', requireAuth, getMe);
router.get('/check-username/:username', checkUsername);
router.patch('/username', requireAuth, updateUsername);

export default router;
