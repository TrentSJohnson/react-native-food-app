import { Router } from 'express';
import { ping, pingDb } from '../controllers/pingController.mjs';

const router = Router();

router.get('/', ping);
router.get('/db', pingDb);

export default router;
