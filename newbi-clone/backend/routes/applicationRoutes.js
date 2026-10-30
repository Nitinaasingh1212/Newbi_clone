import express from 'express';
import {
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  submitContentProof,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyApplications);
router.post('/:id/proof', protect, submitContentProof);

// Admin routes
router.get('/', protect, authorize('admin', 'brand'), getAllApplications);
router.put('/:id/status', protect, authorize('admin', 'brand'), updateApplicationStatus);

export default router;
