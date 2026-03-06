import { Router } from 'express';
import {
  acceptRequest,
  deleteRequest,
  getReceivedRequests,
  getSentRequests,
  sendFriendRequest,
} from '../controllers/subscriberController.mjs';
import { requireAuth } from '../middleware/requireAuth.mjs';

const router = Router();

router.post('/request/:targetUserId', requireAuth, sendFriendRequest);
router.get('/requests/received', requireAuth, getReceivedRequests);
router.get('/requests/sent', requireAuth, getSentRequests);
router.patch('/requests/:requestId/accept', requireAuth, acceptRequest);
router.delete('/requests/:requestId', requireAuth, deleteRequest);

export default router;
