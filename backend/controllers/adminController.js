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
    const users = await User.aggregate([
      // Match only student users
      { $match: { role: 'user' } },
      // Lookup semester data
      {
        $lookup: {
          from: 'semesters',
          localField: '_id',
          foreignField: 'user',
          as: 'semesters'
        }
      },
      // Unwind the semesters array
      { $unwind: { path: '$semesters', preserveNullAndEmptyArrays: true } },
      // Calculate grade points for each subject
      {
        $addFields: {
          'semesters.weightedPoints': {
            $reduce: {
              input: { $objectToArray: '$semesters.subjects' },
              initialValue: { totalPoints: 0, totalCredits: 0 },
              in: {
                totalPoints: {
                  $add: [
                    '$$value.totalPoints',
                    {
                      $multiply: [
                        { $ifNull: [calculateGradePoint('$$this.v.grade'), 0] },
                        { $ifNull: ['$$this.v.credits', 0] }
                      ]
                    }
                  ]
                },
                totalCredits: {
                  $add: ['$$value.totalCredits', { $ifNull: ['$$this.v.credits', 0] }]
                }
              }
            }
          }
        }
      },
      // Calculate GPA for each semester
      {
        $addFields: {
          'semesters.gpa': {
            $cond: {
              if: { $gt: ['$semesters.weightedPoints.totalCredits', 0] },
              then: {
                $divide: [
                  '$semesters.weightedPoints.totalPoints',
                  '$semesters.weightedPoints.totalCredits'
                ]
              },
              else: 0
            }
          }
        }
      },
      // Group back by user
      {
        $group: {
          _id: '$_id',
          registerNumber: { $first: '$registerNumber' },
          username: { $first: '$username' },
          email: { $first: '$email' },
          department: { $first: '$department' },
          batch: { $first: '$batch' },
          semesters: { $push: '$semesters' },
          totalGradePoints: { $sum: '$semesters.weightedPoints.totalPoints' },
          totalCredits: { $sum: '$semesters.weightedPoints.totalCredits' }
        }
      },
      // Calculate CGPA
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
      // Project only necessary fields
      {
        $project: {
          _id: 1,
          registerNumber: 1,
          username: 1,
          email: 1,
          department: 1,
          batch: 1,
          cgpa: { $round: ['$cgpa', 2] },
          totalCredits: 1,
          semesterCount: { $size: '$semesters' }
        }
      },
      // Sort by register number
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
