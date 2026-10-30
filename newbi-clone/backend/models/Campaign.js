import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Concert', 'Brand Activation', 'Campus Fest', 'Nightlife', 'Influencer', 'PR Launch'],
      default: 'Concert',
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: 'Mumbai',
    },
    eventDate: {
      type: String,
      default: 'November 2026',
    },
    requirements: {
      type: [String],
      default: ['Creator or Business Instagram account', 'Min 5,000 followers', 'Active in lifestyle or music niche'],
    },
    deliverables: {
      type: [String],
      default: ['1x Instagram Reel with sound track', '3x Story updates during show', 'Tag @newbi.live and brand'],
    },
    reward: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 500,
    },
    spotsTotal: {
      type: Number,
      default: 10,
    },
    spotsFilled: {
      type: Number,
      default: 3,
    },
    minFollowers: {
      type: Number,
      default: 5000,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'closed'],
      default: 'open',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
export default Campaign;
