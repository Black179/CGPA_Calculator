const User = require('../models/User');

const saveSemesterData = async (req, res) => {
  try {
    const { semesterData, cgpa, completedSemesters } = req.body;

    if (!semesterData) {
      return res.status(400).json({
        error: 'Semester data is required'
      });
    }

    // Update or add semester data
    const user = await User.findById(req.user._id);

    // Remove existing semester data for the same semesters
    user.semesterData = user.semesterData.filter(
      data => !semesterData.some(newData => newData.semester === data.semester)
    );

    // Add new semester data
    user.semesterData.push(...semesterData);

    // Add CGPA history if provided
    if (cgpa && completedSemesters) {
      user.cgpaHistory.push({
        cgpa,
        completedSemesters
      });
    }

    await user.save();

    res.json({
      message: 'Semester data saved successfully',
      semesterData: user.semesterData,
      cgpaHistory: user.cgpaHistory
    });

  } catch (error) {
    console.error('Save semester data error:', error);
    res.status(500).json({
      error: 'Failed to save semester data',
      message: error.message
    });
  }
};

const getSemesterData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('semesterData cgpaHistory');

    res.json({
      semesterData: user.semesterData,
      cgpaHistory: user.cgpaHistory
    });
  } catch (error) {
    console.error('Get semester data error:', error);
    res.status(500).json({
      error: 'Failed to fetch semester data',
      message: error.message
    });
  }
};

module.exports = { saveSemesterData, getSemesterData };
