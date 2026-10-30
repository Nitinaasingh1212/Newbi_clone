import express from 'express';
import {
  submitContact,
  getContactMessages,
  updateMessageStatus,
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', protect, authorize('admin'), getContactMessages);
router.put('/:id', protect, authorize('admin'), updateMessageStatus);

export default router;
