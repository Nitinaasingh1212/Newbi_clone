import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'content_submitted', 'completed'],
      default: 'pending',
    },
    pitch: {
      type: String,
      default: '',
    },
    socialHandle: {
      type: String,
      default: '',
    },
    contentLinks: {
      type: [String],
      default: [],
    },
    adminNotes: {
      type: String,
      default: '',
    },
    payoutStatus: {
      type: String,
      enum: ['unpaid', 'processing', 'paid'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
);

const Application =
  mongoose.models.Application ||
  mongoose.model('Application', applicationSchema);

export default Application;
