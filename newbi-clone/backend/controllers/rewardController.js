import Reward from '../models/Reward.js';
import User from '../models/User.js';

// @desc    Get all rewards
// @route   GET /api/rewards
export const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find().sort({ pointsCost: 1 });
    res.json({ success: true, count: rewards.length, data: rewards });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching rewards' });
  }
};

// @desc    Redeem a reward
// @route   POST /api/rewards/:id/redeem
export const redeemReward = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    if (reward.stock <= 0) {
      return res.status(400).json({ message: 'Sorry, this perk is currently out of stock' });
    }

    const user = await User.findById(req.user._id);
    if (user.points < reward.pointsCost) {
      return res.status(400).json({
        message: `Insufficient points! You have ${user.points} points, but need ${reward.pointsCost} points.`,
      });
    }

    // Deduct points & increment claimed
    user.points -= reward.pointsCost;
    await user.save();

    reward.stock -= 1;
    reward.claimed += 1;
    await reward.save();

    res.json({
      success: true,
      message: `Congratulations! You successfully redeemed: "${reward.title}". Check your email for your e-ticket / dispatch details.`,
      remainingPoints: user.points,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error redeeming reward' });
  }
};

// @desc    Create a reward (Admin)
// @route   POST /api/rewards
export const createReward = async (req, res) => {
  try {
    const reward = await Reward.create(req.body);
    res.status(201).json({ success: true, data: reward });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating reward' });
  }
};
