import React from 'react';
import { motion } from 'framer-motion';

const Header = ({ isDarkMode, selectedBatch = '2024-2028' }) => {
  return (
    <header className={`relative overflow-hidden ${isDarkMode
      ? 'bg-gradient-to-r from-gray-800 via-purple-800 to-violet-800'
      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600'} py-16`}>

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"
          style={{
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 text-center">

        {/* Logo/Image Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.img
              src="/WhatsApp Image 2025-10-09 at 22.02.17_d1f1263a.jpg"
              alt="EE VLSI Design & Technology Logo"
              className="max-w-[200px] md:max-w-[280px] lg:max-w-[360px] xl:max-w-[420px] h-auto object-contain drop-shadow-xl"
              style={{
                filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))'
              }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            EE (VLSI Design & Technology)
          </h1>
          <motion.h2
            className="text-xl md:text-2xl text-blue-100 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            CGPA Calculator
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-purple-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Batch {selectedBatch} | Regulation 2022
          </motion.p>
        </motion.div>

        {/* Floating decorative elements */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full hidden md:block"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 right-10 w-16 h-16 border-2 border-purple-200/30 rounded-full hidden md:block"
        />
      </div>
    </header>
  );
};

export default Header;
