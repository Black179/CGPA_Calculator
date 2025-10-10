import React from 'react';
import { motion } from 'framer-motion';

const BatchSelector = ({ selectedBatch, onBatchChange, isDarkMode }) => {
  const batchOptions = [
    { value: '2024-2028', label: '2024-2028 (Current Batch)' },
    { value: '2025-2029', label: '2025-2029' },
    { value: '2026-2030', label: '2026-2030' },
    { value: '2027-2031', label: '2027-2031' },
    { value: '2028-2032', label: '2028-2032' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`mb-8 p-6 rounded-2xl shadow-lg ${
        isDarkMode
          ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700'
          : 'bg-white/80 backdrop-blur-sm border border-gray-200'
      }`}
    >
      <h3 className={`text-xl font-bold mb-4 text-center ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        Select Academic Batch
      </h3>

      <div className="flex justify-center">
        <div className="relative">
          <select
            value={selectedBatch}
            onChange={(e) => onBatchChange(e.target.value)}
            className={`appearance-none px-6 py-3 pr-10 rounded-xl font-semibold text-lg transition-all duration-300 cursor-pointer ${
              isDarkMode
                ? 'bg-gray-700 border-2 border-purple-500 text-white hover:bg-gray-600 focus:ring-2 focus:ring-purple-500'
                : 'bg-white border-2 border-blue-500 text-gray-800 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500'
            } focus:outline-none`}
          >
            {batchOptions.map((batch) => (
              <option key={batch.value} value={batch.value}>
                {batch.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${
            isDarkMode ? 'text-purple-400' : 'text-blue-500'
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`text-sm text-center mt-3 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}
      >
        Showing results for Batch {selectedBatch}
      </motion.p>
    </motion.div>
  );
};

export default BatchSelector;
