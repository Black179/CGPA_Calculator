import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const UserDashboard = ({ onLogout }) => {
  const { user } = useAuth();
  const [semesterData, setSemesterData] = useState([]);
  const [cgpaHistory, setCgpaHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/semester/data');
        setSemesterData(response.data.semesterData || []);
        setCgpaHistory(response.data.cgpaHistory || []);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-6"
    >
      {/* Welcome Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-600">Register Number: {user?.registerNumber}</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Logout
        </button>
      </div>

      {/* CGPA Summary */}
      {cgpaHistory.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CGPA Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Latest CGPA</p>
              <p className="text-2xl font-bold text-blue-600">
                {cgpaHistory[cgpaHistory.length - 1]?.cgpa?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Completed Semesters</p>
              <p className="text-2xl font-bold text-green-600">
                {cgpaHistory[cgpaHistory.length - 1]?.completedSemesters?.length || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Account Created</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Semester Data Overview */}
      {semesterData.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Semester Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semesterData.map((semester) => (
              <motion.div
                key={semester.semester}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <h4 className="font-semibold text-gray-900 mb-2">
                  Semester {semester.semester}
                </h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    GPA: <span className="font-medium text-blue-600">{semester.gpa?.toFixed(2) || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Subjects: <span className="font-medium">{Object.keys(semester.grades || {}).length}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(semester.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No semester data yet</h3>
          <p className="text-gray-600">Start calculating your CGPA to see your records here!</p>
        </div>
      )}

      {/* CGPA History */}
      {cgpaHistory.length > 1 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">CGPA Progress</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {cgpaHistory.slice(-5).map((record, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Semesters: {record.completedSemesters?.join(', ') || 'N/A'}
                    </span>
                    <span className="font-semibold text-green-600">
                      {record.cgpa?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserDashboard;
