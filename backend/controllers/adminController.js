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
    const users = await User.find({ role: 'user' })
      .select('-password')
      .populate('semesters')
      .sort({ registerNumber: 1 });

    // Calculate CGPA for each student
    const usersWithCGPA = users.map(user => {
      let totalCredits = 0;
      let totalGradePoints = 0;
      
      if (user.semesters && user.semesters.length > 0) {
        user.semesters.forEach(semester => {
          if (semester.subjects && semester.subjects.length > 0) {
            semester.subjects.forEach(subject => {
              if (subject.grade && subject.credits) {
                const gradePoint = calculateGradePoint(subject.grade);
                totalGradePoints += gradePoint * subject.credits;
                totalCredits += subject.credits;
              }
            });
          }
        });
      }

      const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 'N/A';
      
      return {
        ...user.toObject(),
        cgpa,
        totalCredits
      };
    });

    res.json({
      success: true,
      count: usersWithCGPA.length,
      users: usersWithCGPA
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
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
