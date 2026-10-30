import mongoose from 'mongoose';

const creatorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    instagramHandle: {
      type: String,
      default: '',
    },
    followersCount: {
      type: Number,
      default: 12500,
    },
    engagementRate: {
      type: Number,
      default: 4.8,
    },
    city: {
      type: String,
      default: 'Mumbai',
    },
    niche: {
      type: [String],
      default: ['Music', 'Nightlife', 'College Culture'],
    },
    bio: {
      type: String,
      default: 'Creator covering live music, festivals, campus concerts & underground scenes.',
    },
    verified: {
      type: Boolean,
      default: true,
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },
    totalCompletedCampaigns: {
      type: Number,
      default: 4,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
  },
  { timestamps: true }
);

const CreatorProfile =
  mongoose.models.CreatorProfile ||
  mongoose.model('CreatorProfile', creatorProfileSchema);

export default CreatorProfile;
