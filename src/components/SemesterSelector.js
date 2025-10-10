import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { semesterSubjects, gradeOptions } from '../utils/semesterData';

const SemesterSelector = ({ 
  selectedSemesters, 
  semesterData, 
  onSemesterToggle, 
  onSubjectGradeChange,
  isDarkMode 
}) => {
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);
  const semesterRefs = useRef({});

  // Auto-scroll to semester section when it's selected
  useEffect(() => {
    Object.keys(selectedSemesters).forEach(semester => {
      if (selectedSemesters[semester] && semesterRefs.current[semester]) {
        setTimeout(() => {
          semesterRefs.current[semester].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 300); // Delay to allow animation to start
      }
    });
  }, [selectedSemesters]);

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
          Select Semesters & Enter Grades
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {semesters.map((semester) => (
            <motion.button
              key={semester}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSemesterToggle(semester)}
              className={`p-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                selectedSemesters[semester]
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semester {semester}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {Object.entries(selectedSemesters).map(([semester, isSelected]) => (
            isSelected && (
              <motion.div
                key={semester}
                ref={(el) => (semesterRefs.current[semester] = el)}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-8 rounded-xl p-6 ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border border-gray-600' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <h3 className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Semester {semester} Subjects
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {semesterSubjects[semester]?.map((subject) => (
                    <motion.div
                      key={subject.code}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
                      } shadow-sm`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-700'
                          }`}>
                            {subject.name}
                          </h4>
                          <p className={`text-xs mt-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {subject.code} • {subject.credits} credits
                          </p>
                        </div>
                      </div>

                      <select
                        value={semesterData[semester]?.[subject.code] || ''}
                        onChange={(e) => onSubjectGradeChange(semester, subject.code, e.target.value)}
                        className={`w-full p-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                            : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                        } border focus:outline-none focus:ring-2`}
                      >
                        <option value="">Select Grade</option>
                        {gradeOptions.map((grade) => (
                          <option key={grade.value} value={grade.value}>
                            {grade.value} - {grade.label}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SemesterSelector;
