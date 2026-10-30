import User from '../models/User.js';
import Campaign from '../models/Campaign.js';
import Application from '../models/Application.js';
import ContactMessage from '../models/ContactMessage.js';
import Project from '../models/Project.js';
import Reward from '../models/Reward.js';

// @desc    Get Admin dashboard overview statistics
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCreators,
      totalBrands,
      totalCampaigns,
      activeCampaigns,
      totalApplications,
      pendingApplications,
      totalMessages,
      newMessages,
      totalProjects,
      totalRewards,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'creator' }),
      User.countDocuments({ role: 'brand' }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'open' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'new' }),
      Project.countDocuments(),
      Reward.countDocuments(),
    ]);

    const recentApplications = await Application.find()
      .populate('user', 'name email')
      .populate('campaign', 'title brand reward')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentMessages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCreators,
        totalBrands,
        totalCampaigns,
        activeCampaigns,
        totalApplications,
        pendingApplications,
        totalMessages,
        newMessages,
        totalProjects,
        totalRewards,
        recentApplications,
        recentMessages,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching admin stats' });
  }
};

// @desc    Get all users with search & filter
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching users' });
  }
};

// @desc    Update user (e.g. role change, points adjustment)
// @route   PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const { role, points, name, organization } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) user.role = role;
    if (points !== undefined) user.points = points;
    if (name) user.name = name;
    if (organization !== undefined) user.organization = organization;

    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating user' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting user' });
  }
};
