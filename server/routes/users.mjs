import { Router } from 'express';
import { getUsers, upsertUser } from '../controllers/userController.mjs';

const router = Router();

router.get('/', getUsers);
router.post('/upsert', upsertUser);

export default router;
