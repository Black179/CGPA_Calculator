const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      user: {
        id: user._id,
        registerNumber: user.registerNumber,
        username: user.username,
        email: user.email,
        batch: user.batch,
        semesterData: user.semesterData,
        cgpaHistory: user.cgpaHistory,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, batch } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(username && { username }),
        ...(batch && { batch })
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        registerNumber: updatedUser.registerNumber,
        username: updatedUser.username,
        email: updatedUser.email,
        batch: updatedUser.batch
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
};

module.exports = { getProfile, updateProfile };
