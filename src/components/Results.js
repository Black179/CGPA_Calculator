import React from 'react';
import { motion } from 'framer-motion';
import { formatGPA } from '../utils/gradeCalculator';

const Results = ({ gpaResults, cgpaResult, isDarkMode }) => {
  const hasResults = Object.keys(gpaResults).length > 0 || cgpaResult > 0;

  if (!hasResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-4xl mx-auto rounded-2xl shadow-2xl p-8 text-center ${
          isDarkMode 
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700' 
            : 'bg-white/80 backdrop-blur-sm border border-gray-200'
        }`}
      >
        <div className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Enter grades for subjects to see your GPA and CGPA results
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl shadow-2xl p-8 ${
          isDarkMode 
            ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700' 
            : 'bg-white/80 backdrop-blur-sm border border-gray-200'
        }`}
      >
        <h2 className={`text-3xl font-bold text-center mb-8 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Your Results
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Semester GPAs */}
          <div>
            <h3 className={`text-2xl font-semibold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Semester GPAs
            </h3>
            <div className="space-y-4">
              {Object.entries(gpaResults).map(([semester, gpa]) => (
                <motion.div
                  key={semester}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: parseInt(semester) * 0.1 }}
                  className={`p-4 rounded-xl ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-500/30' 
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Semester {semester}
                    </span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: parseInt(semester) * 0.1 + 0.2, type: "spring" }}
                      className={`text-2xl font-bold ${
                        gpa >= 8 ? 'text-green-400' :
                        gpa >= 6 ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      {formatGPA(gpa)}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Overall CGPA */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className={`relative p-8 rounded-2xl shadow-2xl ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600' 
                  : 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500'
              } text-white`}
            >
              {/* Animated background glow */}
              <motion.div
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"
              />

              <div className="relative text-center">
                <motion.h3 
                  className="text-2xl font-semibold mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Overall CGPA
                </motion.h3>
                <motion.div
                  className="text-6xl font-bold mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                >
                  {formatGPA(cgpaResult)}
                </motion.div>
                <motion.p 
                  className="text-sm opacity-90"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  Based on {Object.keys(gpaResults).length} semester{Object.keys(gpaResults).length !== 1 ? 's' : ''}
                </motion.p>
              </div>

              {/* Decorative elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-4 left-4 w-6 h-6 border-2 border-white/20 rounded-full"
              />
            </motion.div>
          </div>
        </div>

        {/* Performance indicator */}
        {cgpaResult > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mt-8 text-center"
          >
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
              cgpaResult >= 9 ? 'bg-green-100 text-green-800' :
              cgpaResult >= 8 ? 'bg-blue-100 text-blue-800' :
              cgpaResult >= 7 ? 'bg-yellow-100 text-yellow-800' :
              cgpaResult >= 6 ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {cgpaResult >= 9 ? '🌟 Outstanding Performance!' :
               cgpaResult >= 8 ? '⭐ Excellent Performance!' :
               cgpaResult >= 7 ? '👍 Good Performance!' :
               cgpaResult >= 6 ? '📈 Keep Improving!' :
               '💪 Work Harder!'}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Results;
