import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Concerts', 'Campus Fests', 'Brand Activations', 'Creator Tours'],
      default: 'Concerts',
    },
    brandOrArtist: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: 'Mumbai',
    },
    date: {
      type: String,
      default: '2026',
    },
    footfall: {
      type: String,
      default: '15,000+ attendees',
    },
    reach: {
      type: String,
      default: '3.5M impressions',
    },
    creatorsInvolved: {
      type: Number,
      default: 12,
    },
    image: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: ['Live Production', 'Creator Network', 'Sound & Light'],
    },
  },
  { timestamps: true }
);

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default Project;
