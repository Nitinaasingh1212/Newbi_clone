import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CreatorProfile from '../models/CreatorProfile.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'newbi_jwt_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, instagramHandle, city, organization, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'creator',
      organization: organization || '',
      phone: phone || '',
      points: 250,
    });

    let creatorProfile = null;
    if (user.role === 'creator') {
      creatorProfile = await CreatorProfile.create({
        user: user._id,
        instagramHandle: instagramHandle || `@${name.toLowerCase().replace(/\s+/g, '')}`,
        city: city || 'Mumbai',
        followersCount: 15400,
        engagementRate: 5.2,
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        points: user.points,
      },
      creatorProfile,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let creatorProfile = null;
    if (user.role === 'creator') {
      creatorProfile = await CreatorProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        points: user.points,
      },
      creatorProfile,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let creatorProfile = null;
    if (user.role === 'creator') {
      creatorProfile = await CreatorProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user,
      creatorProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
