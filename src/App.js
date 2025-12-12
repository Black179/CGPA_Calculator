import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import BatchSelector from './components/BatchSelector';
import SemesterSelector from './components/SemesterSelector';
import Results from './components/Results';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { calculateGPA, calculateCGPA } from './utils/gradeCalculator';

const getStoredCGPA = () => {
  try {
    console.log('🔍 Checking for stored CGPA data...');

    // Check localStorage for any stored semester data
    const semesterData = localStorage.getItem('semesterData');
    console.log('📦 localStorage semesterData:', semesterData ? 'Found' : 'Not found');

    if (semesterData) {
      const parsedData = JSON.parse(semesterData);
      console.log('📊 Parsed data keys:', Object.keys(parsedData));

      // Calculate CGPA from stored data
      const totalCredits = Object.values(parsedData).reduce((sum, semester) => {
        console.log('🔢 Processing semester:', semester);
        return sum + Object.values(semester.subjects || {}).reduce((semSum, subject) => {
          console.log('📚 Subject:', subject.code, 'Credits:', subject.credit, 'Grade:', subject.grade);
          return semSum + (subject.credit || 0);
        }, 0);
      }, 0);

      const totalPoints = Object.values(parsedData).reduce((sum, semester) => {
        return sum + Object.values(semester.subjects || {}).reduce((semSum, subject) => {
          const grade = subject.grade;
          const gradePoint = getGradePoint(grade);
          console.log('⭐ Grade:', grade, 'Points:', gradePoint);
          return semSum + (gradePoint * (subject.credit || 0));
        }, 0);
      }, 0);

      console.log('📈 Total Credits:', totalCredits, 'Total Points:', totalPoints);

      if (totalCredits > 0) {
        const cgpa = (totalPoints / totalCredits).toFixed(2);
        console.log('🏆 Calculated CGPA:', cgpa);
        return cgpa;
      }
    }

    // Check if user has logged in before and has server data
    const token = localStorage.getItem('token');
    console.log('🔑 Auth token:', token ? 'Found' : 'Not found');

    if (token) {
      console.log('👤 User is logged in, but no local data found');
      return null;
    }

    console.log('❓ No stored CGPA data found');
    return null;
  } catch (error) {
    console.error('❌ Error calculating stored CGPA:', error);
    return null;
  }
};

const getGradePoint = (grade) => {
  const gradeMap = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6,
    'C': 5, 'P': 4, 'F': 0, 'Absent': 0
  };
  return gradeMap[grade] || 0;
};

function AppContent() {
  const {
    isAuthenticated,
    isAdminAuthenticated,
    loading,
    user,
    admin,
    semesterData,
    cgpaHistory,
    saveSemesterData,
    logout,
    adminLogout,
    adminLogin
  } = useAuth();

  const [selectedSemesters, setSelectedSemesters] = useState({});
  const [currentSemesterData, setCurrentSemesterData] = useState({});
  const [gpaResults, setGpaResults] = useState({});
  const [cgpaResult, setCgpaResult] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('2024-2028');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Load user data into current semester data when authenticated
  useEffect(() => {
    if (isAuthenticated && semesterData.length > 0) {
      const loadedData = {};
      semesterData.forEach(semester => {
        loadedData[semester.semester] = semester.grades || {};
      });
      setCurrentSemesterData(loadedData);
    }
  }, [isAuthenticated, semesterData]);

  // Calculate GPAs whenever semester data changes
  useEffect(() => {
    const newGpaResults = {};
    Object.keys(currentSemesterData).forEach(semester => {
      if (currentSemesterData[semester] && Object.keys(currentSemesterData[semester]).length > 0) {
        const result = calculateGPA(currentSemesterData[semester], parseInt(semester));
        newGpaResults[semester] = result.gpa;
      }
    });
    setGpaResults(newGpaResults);

    // Calculate CGPA when we have GPA results
    if (Object.keys(newGpaResults).length > 0) {
      setCgpaResult(calculateCGPA(newGpaResults, currentSemesterData));
    } else {
      setCgpaResult(0);
    }
  }, [currentSemesterData]);

  // Auto-save semester data when it changes (debounced)
  useEffect(() => {
    if (!isAuthenticated || Object.keys(currentSemesterData).length === 0) return;

    const timeoutId = setTimeout(async () => {
      try {
        const semesterDataArray = Object.keys(currentSemesterData).map(semester => ({
          semester: parseInt(semester),
          grades: currentSemesterData[semester],
          gpa: gpaResults[semester] || 0,
          lastUpdated: new Date()
        }));

        const completedSemesters = Object.keys(gpaResults);
        await saveSemesterData(semesterDataArray, cgpaResult, completedSemesters);
      } catch (error) {
        console.error('Failed to save semester data:', error);
      }
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [currentSemesterData, gpaResults, cgpaResult, isAuthenticated, saveSemesterData]);

  const handleSemesterToggle = (semester) => {
    setSelectedSemesters(prev => ({
      ...prev,
      [semester]: !prev[semester]
    }));
  };

  const handleSubjectGradeChange = (semester, subjectCode, grade) => {
    setCurrentSemesterData(prev => ({
      ...prev,
      [semester]: {
        ...prev[semester],
        [subjectCode]: grade
      }
    }));
  };

  const handleBatchChange = (newBatch) => {
    setSelectedBatch(newBatch);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    setCurrentSemesterData({});
    setGpaResults({});
    setCgpaResult(0);
    setSelectedSemesters({});
  };

  const handleAdminLogout = () => {
    adminLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show combined login interface if neither user nor admin is authenticated
  if (!isAuthenticated && !isAdminAuthenticated) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>

        <Header isDarkMode={isDarkMode} selectedBatch={selectedBatch} />

        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg mx-auto"
          >
            <div className={`rounded-xl shadow-2xl overflow-hidden ${isDarkMode
              ? 'bg-white'
              : 'bg-gradient-to-br from-violet-200 via-purple-200 to-sky-200'}`}>
              <div className={`px-8 py-6 ${isDarkMode ? '' : 'text-gray-900'}`}>
                <div className="text-center mb-8">
                  <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-gray-900' : 'text-gray-900'}`}>Welcome to CGPA Calculator</h1>
                  <p className={`${isDarkMode ? 'text-gray-600' : 'text-gray-700'}`}>
                    Choose your login type to continue
                  </p>
                </div>

                {/* Login Type Selection */}
                <div className={`grid grid-cols-2 gap-4 mb-8 ${isDarkMode ? 'bg-gray-100' : 'bg-white/80 backdrop-blur-sm'} rounded-lg p-2`}>
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setShowRegister(false);
                      setShowAdminLogin(false);
                    }}
                    className={`py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      showLogin || (!showAdminLogin && !showRegister)
                        ? `${isDarkMode ? 'bg-white text-blue-600' : 'bg-white/90 text-purple-600 backdrop-blur-sm'} shadow-sm`
                        : `${isDarkMode ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-gray-800'}`
                    }`}
                  >
                    Student Login
                  </button>
                  <button
                    onClick={() => {
                      setShowAdminLogin(true);
                      setShowLogin(false);
                      setShowRegister(false);
                    }}
                    className={`py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                      showAdminLogin
                        ? `${isDarkMode ? 'bg-white text-green-600' : 'bg-white/90 text-purple-600 backdrop-blur-sm'} shadow-sm`
                        : `${isDarkMode ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-gray-800'}`
                    }`}
                  >
                    Admin Login
                  </button>
                </div>

                {/* Student Authentication Section */}
                <div className="mb-6" onClick={(e) => e.stopPropagation()}>
                  <div className={`flex mb-4 rounded-lg p-1 ${isDarkMode ? 'bg-gray-100' : 'bg-white/80 backdrop-blur-sm'}`}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLogin(true);
                        setShowRegister(false);
                        setShowAdminLogin(false);
                      }}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                        showLogin && !showRegister
                          ? `${isDarkMode ? 'bg-white text-blue-600' : 'bg-white/90 text-purple-600 backdrop-blur-sm'} shadow-sm`
                          : `${isDarkMode ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-gray-800'}`
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRegister(true);
                        setShowLogin(false);
                        setShowAdminLogin(false);
                      }}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                        showRegister
                          ? `${isDarkMode ? 'bg-white text-green-600' : 'bg-white/90 text-purple-600 backdrop-blur-sm'} shadow-sm`
                          : `${isDarkMode ? 'text-gray-600 hover:text-gray-900' : 'text-gray-600 hover:text-gray-800'}`
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {showLogin && (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Login
                          onClose={() => {}}
                          onSwitchToRegister={() => {
                            setShowLogin(false);
                            setShowRegister(true);
                          }}
                        />
                      </motion.div>
                    )}

                    {showRegister && (
                      <motion.div
                        key="register"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Register
                          onClose={() => {}}
                          onSwitchToLogin={() => {
                            setShowRegister(false);
                            setShowLogin(true);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Admin Authentication Section */}
                {showAdminLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AdminLogin
                      onLogin={(adminData) => {
                        setShowAdminLogin(false);
                        // Admin is now logged in via context
                      }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </main>

        <Footer
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          selectedBatch={selectedBatch}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode
      ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>

      <Header isDarkMode={isDarkMode} selectedBatch={selectedBatch} />

      <main className="container mx-auto px-4 py-8">
        {/* Admin Dashboard */}
        {isAdminAuthenticated && (
          <AdminDashboard onLogout={handleAdminLogout} />
        )}

        {/* User Dashboard - Only show if not admin */}
        {!isAdminAuthenticated && (
          <>
            <UserDashboard onLogout={handleLogout} />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <BatchSelector
                selectedBatch={selectedBatch}
                onBatchChange={handleBatchChange}
                isDarkMode={isDarkMode}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <SemesterSelector
                selectedSemesters={selectedSemesters}
                semesterData={currentSemesterData}
                onSemesterToggle={handleSemesterToggle}
                onSubjectGradeChange={handleSubjectGradeChange}
                isDarkMode={isDarkMode}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Results
                gpaResults={gpaResults}
                cgpaResult={cgpaResult}
                selectedBatch={selectedBatch}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          </>
        )}
      </main>

      <Footer
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        selectedBatch={selectedBatch}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
