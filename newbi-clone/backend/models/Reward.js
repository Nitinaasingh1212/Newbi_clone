import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Event Pass', 'Merchandise', 'Electronics', 'Voucher'],
      default: 'Event Pass',
    },
    pointsCost: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 20,
    },
    claimed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Reward = mongoose.models.Reward || mongoose.model('Reward', rewardSchema);
export default Reward;
