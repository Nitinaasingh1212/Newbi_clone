import Application from '../models/Application.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';

// @desc    Get current user's applications
// @route   GET /api/applications/my
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('campaign')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching applications' });
  }
};

// @desc    Get all applications (Admin)
// @route   GET /api/applications
export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('user', 'name email role points')
      .populate('campaign', 'title brand reward location eventDate')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching applications' });
  }
};

// @desc    Update application status (Admin)
// @route   PUT /api/applications/:id/status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNotes, payoutStatus } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (status) application.status = status;
    if (adminNotes !== undefined) application.adminNotes = adminNotes;
    if (payoutStatus) application.payoutStatus = payoutStatus;

    // If marked completed, credit user points
    if (status === 'completed' && application.status !== 'completed') {
      const campaign = await Campaign.findById(application.campaign);
      const pointsToAdd = campaign?.points || 300;
      await User.findByIdAndUpdate(application.user, { $inc: { points: pointsToAdd } });
    }

    await application.save();
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating application status' });
  }
};

// @desc    Submit content proof / links by creator
// @route   POST /api/applications/:id/proof
export const submitContentProof = async (req, res) => {
  try {
    const { contentLinks } = req.body;
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    application.contentLinks = contentLinks || [];
    application.status = 'content_submitted';
    await application.save();

    res.json({
      success: true,
      message: 'Proof submitted! The Newbi team will review your post within 24 hours.',
      data: application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error submitting content proof' });
  }
};
