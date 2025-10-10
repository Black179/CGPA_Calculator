import React from 'react';
import { motion } from 'framer-motion';

const Footer = ({ isDarkMode, onToggleDarkMode, selectedBatch }) => {
  return (
    <footer className={`relative mt-16 ${isDarkMode
      ? 'bg-gray-900/50 backdrop-blur-sm'
      : 'bg-white/80 backdrop-blur-sm'} border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>

      {/* Animated border */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`h-1 bg-gradient-to-r ${
          isDarkMode
            ? 'from-purple-500 via-violet-500 to-indigo-500'
            : 'from-blue-500 via-purple-500 to-indigo-500'
        }`}
        style={{
          backgroundSize: '200% 100%',
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">

          {/* Copyright text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-center md:text-left mb-4 md:mb-0 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            <p className="text-lg font-medium">
              © 2025 EE - VLSI Design & Technology
            </p>
            <p className="text-sm mt-1">
              Batch {selectedBatch} | Developed with ❤ by Students
            </p>
          </motion.div>

          {/* Dark mode toggle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-14 w-24 items-center rounded-full transition-all duration-300 ${
                isDarkMode
                  ? 'bg-gray-700 border border-gray-600'
                  : 'bg-gray-200 border border-gray-300'
              }`}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'translate-x-11 bg-gradient-to-r from-purple-500 to-violet-500'
                    : 'translate-x-1 bg-gradient-to-r from-yellow-400 to-orange-400'
                }`}
              />

              {/* Sun/Moon icons */}
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <motion.div
                  initial={false}
                  animate={{ opacity: isDarkMode ? 0 : 1, scale: isDarkMode ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="text-yellow-500"
                >
                  ☀️
                </motion.div>
                <motion.div
                  initial={false}
                  animate={{ opacity: isDarkMode ? 1 : 0, scale: isDarkMode ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-purple-300"
                >
                  🌙
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`mt-8 pt-6 border-t text-center ${
            isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
          }`}
        >
          <p className="text-sm">
            Regulation 2022 • Batch {selectedBatch} • CGPA Calculator
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
