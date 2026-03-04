import { Router } from 'express';
import { upsertUser } from '../controllers/userController.mjs';

const router = Router();

router.post('/upsert', upsertUser);

export default router;
