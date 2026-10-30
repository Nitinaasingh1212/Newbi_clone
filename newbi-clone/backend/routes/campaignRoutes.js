import express from 'express';
import {
  getCampaigns,
  getCampaignById,
  applyToCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaignController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/:id/apply', protect, applyToCampaign);

// Admin / Brand protected endpoints
router.post('/', protect, authorize('admin', 'brand'), createCampaign);
router.put('/:id', protect, authorize('admin', 'brand'), updateCampaign);
router.delete('/:id', protect, authorize('admin'), deleteCampaign);

export default router;
