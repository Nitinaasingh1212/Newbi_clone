import express from 'express';
import {
  getRewards,
  redeemReward,
  createReward,
} from '../controllers/rewardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getRewards);
router.post('/:id/redeem', protect, redeemReward);
router.post('/', protect, authorize('admin'), createReward);

export default router;
