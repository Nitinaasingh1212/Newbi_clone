import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    audience: {
      type: String,
      enum: ['brand', 'college', 'artist', 'other'],
      default: 'brand',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    organization: {
      type: String,
      default: '',
    },
    budget: {
      type: String,
      default: '',
    },
    timeline: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    status: {
      type: String,
      enum: ['new', 'in_discussion', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
