const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to calculate grade points
const calculateGradePoint = (grade) => {
  const gradeMap = {
    'S': 10,
    'A+': 9,
    'A': 8.5,
    'B+': 8,
    'B': 7.5,
    'C+': 7,
    'C': 6.5,
    'D+': 6,
    'D': 5.5,
    'E': 5,
    'F': 0,
    'I': 0,
    'W': 0
  };
  return gradeMap[grade] || 0;
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find admin user
    const admin = await User.findOne({
      email: email.toLowerCase(),
      role: 'admin'
    });

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(admin._id);

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        registerNumber: admin.registerNumber,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: 'Admin login failed',
      message: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Set headers to prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const users = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $lookup: {
          from: 'semesters',
          localField: '_id',
          foreignField: 'user',
          as: 'semesters'
        }
      },
      { $unwind: { path: '$semesters', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          'semesters.weightedPoints': {
            $reduce: {
              input: { $objectToArray: '$semesters.subjects' },
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  {
                    $multiply: [
                      { $ifNull: ['$$this.v.credits', 0] },
                      { $ifNull: [calculateGradePoint('$$this.v.grade'), 0] }
                    ]
                  }
                ]
              }
            }
          },
          'semesters.totalCredits': {
            $reduce: {
              input: { $objectToArray: '$semesters.subjects' },
              initialValue: 0,
              in: { $add: ['$$value', { $ifNull: ['$$this.v.credits', 0] }] }
            }
          }
        }
      },
      {
        $addFields: {
          'semesters.gpa': {
            $cond: {
              if: { $gt: ['$semesters.totalCredits', 0] },
              then: {
                $divide: [
                  '$semesters.weightedPoints',
                  '$semesters.totalCredits'
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          registerNumber: { $first: '$registerNumber' },
          username: { $first: '$username' },
          email: { $first: '$email' },
          batch: { $first: '$batch' },
          department: { $first: '$department' },
          semesters: { $push: '$semesters' },
          totalGradePoints: { $sum: '$semesters.weightedPoints' },
          totalCredits: { $sum: '$semesters.totalCredits' }
        }
      },
      {
        $addFields: {
          cgpa: {
            $cond: {
              if: { $gt: ['$totalCredits', 0] },
              then: { $divide: ['$totalGradePoints', '$totalCredits'] },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          registerNumber: 1,
          username: 1,
          email: 1,
          batch: 1,
          department: 1,
          semesters: 1,
          cgpa: { $round: ['$cgpa', 2] },
          totalCredits: 1,
          backlogs: 0, // You might want to calculate this based on failed subjects
          arrears: 0   // You might want to calculate this based on pending subjects
        }
      },
      { $sort: { registerNumber: 1 } }
    ]);

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const recentUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const usersByBatch = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: '$batch', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        recentUsers,
        usersByBatch
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role specified'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Failed to update user role',
      message: error.message
    });
  }
};

module.exports = {
  adminLogin,
  getAllUsers,
  getUserStats,
  deleteUser,
  updateUserRole
};
