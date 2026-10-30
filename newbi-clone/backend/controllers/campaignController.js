import Campaign from '../models/Campaign.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// @desc    Get all campaigns
// @route   GET /api/campaigns
export const getCampaigns = async (req, res) => {
  try {
    const { category, location, status, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: campaigns.length, data: campaigns });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching campaigns' });
  }
};

// @desc    Get single campaign by ID
// @route   GET /api/campaigns/:id
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching campaign' });
  }
};

// @desc    Apply to a campaign
// @route   POST /api/campaigns/:id/apply
export const applyToCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if already applied
    const existing = await Application.findOne({
      user: req.user._id,
      campaign: campaign._id,
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this campaign' });
    }

    const { pitch, socialHandle } = req.body;

    const application = await Application.create({
      user: req.user._id,
      campaign: campaign._id,
      pitch: pitch || 'Excited to deliver top quality coverage for this activation!',
      socialHandle: socialHandle || '',
      status: 'pending',
    });

    // Award bonus points for applying
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 50 } });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Our crew will review it shortly.',
      data: application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error submitting application' });
  }
};

// @desc    Create a new campaign (Admin or Brand)
// @route   POST /api/campaigns
export const createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating campaign' });
  }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error updating campaign' });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting campaign' });
  }
};
