import { Router } from 'express';
import { checkUsername, getMe, getUsers, searchUsers, updateUsername, upsertUser } from '../controllers/userController.mjs';
import { requireAuth } from '../middleware/requireAuth.mjs';

const router = Router();

router.get('/', requireAuth, getUsers);
router.post('/upsert', requireAuth, upsertUser);
router.get('/me', requireAuth, getMe);
router.get('/check-username/:username', checkUsername);
router.patch('/username', requireAuth, updateUsername);
router.get('/search', requireAuth, searchUsers);

export default router;
