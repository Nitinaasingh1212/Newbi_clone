import User from '../models/User.js';
import CreatorProfile from '../models/CreatorProfile.js';

// @desc    Get user profile
// @route   GET /api/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let creatorProfile = await CreatorProfile.findOne({ user: req.user._id });

    if (!creatorProfile && user.role === 'creator') {
      creatorProfile = await CreatorProfile.create({
        user: user._id,
        instagramHandle: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
      });
    }

    res.json({ success: true, user, creatorProfile });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, organization, instagramHandle, city, niche, bio, portfolioLinks } = req.body;

    // Update User core fields
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (organization !== undefined) user.organization = organization;
    await user.save();

    // Update or create CreatorProfile
    let creatorProfile = await CreatorProfile.findOne({ user: req.user._id });
    if (!creatorProfile) {
      creatorProfile = new CreatorProfile({ user: req.user._id });
    }

    if (instagramHandle !== undefined) creatorProfile.instagramHandle = instagramHandle;
    if (city !== undefined) creatorProfile.city = city;
    if (niche !== undefined) creatorProfile.niche = Array.isArray(niche) ? niche : niche.split(',').map(s => s.trim());
    if (bio !== undefined) creatorProfile.bio = bio;
    if (portfolioLinks !== undefined) creatorProfile.portfolioLinks = Array.isArray(portfolioLinks) ? portfolioLinks : [portfolioLinks];

    await creatorProfile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization,
        points: user.points,
      },
      creatorProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating profile' });
  }
};
