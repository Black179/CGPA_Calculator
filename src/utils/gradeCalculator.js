import { gradePoints, semesterSubjects } from './semesterData';

/**
 * Calculate GPA for a single semester
 * @param {Object} semesterData - Object with subject codes as keys and grades as values
 * @param {number} semesterNumber - The semester number to get subjects from
 * @returns {Object} - Object with GPA and total credits
 */
export const calculateGPA = (semesterData, semesterNumber) => {
  if (!semesterData || Object.keys(semesterData).length === 0) {
    return { gpa: 0, totalCredits: 0 };
  }

  const subjects = semesterSubjects[semesterNumber] || [];
  let totalCredits = 0;
  let totalPoints = 0;

  Object.keys(semesterData).forEach(subjectCode => {
    const grade = semesterData[subjectCode];
    if (grade && grade !== '' && gradePoints[grade] !== undefined) {
      const subject = subjects.find(sub => sub.code === subjectCode);
      if (subject) {
        const points = gradePoints[grade];
        totalCredits += subject.credits;
        totalPoints += points * subject.credits;
      }
    }
  });

  const gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  return { gpa, totalCredits };
};

/**
 * Calculate CGPA from multiple semester GPAs
 * @param {Object} gpaResults - Object with semester numbers as keys and GPA values as values
 * @param {Object} semesterData - Object with semester data for credit calculation
 * @returns {number} - CGPA rounded to 2 decimal places
 */
export const calculateCGPA = (gpaResults, semesterData) => {
  if (!gpaResults || Object.keys(gpaResults).length === 0) {
    return 0;
  }

  let totalCredits = 0;
  let totalPoints = 0;

  Object.keys(gpaResults).forEach(semester => {
    const gpa = gpaResults[semester];
    if (gpa > 0 && semesterData[semester]) {
      // Calculate total credits for this semester from the subjects that have grades
      const semesterSubjectsList = semesterSubjects[semester] || [];
      let semesterCredits = 0;

      Object.keys(semesterData[semester]).forEach(subjectCode => {
        const grade = semesterData[semester][subjectCode];
        if (grade && grade !== '' && gradePoints[grade] !== undefined) {
          const subject = semesterSubjectsList.find(sub => sub.code === subjectCode);
          if (subject) {
            semesterCredits += subject.credits;
          }
        }
      });

      if (semesterCredits > 0) {
        totalCredits += semesterCredits;
        totalPoints += gpa * semesterCredits;
      }
    }
  });

  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
};

/**
 * Get grade point for a specific grade
 * @param {string} grade - The grade (O, A+, A, B+, B, C, D, U)
 * @returns {number} - Grade point
 */
export const getGradePoint = (grade) => {
  return gradePoints[grade] || 0;
};

/**
 * Format GPA/CGPA display value
 * @param {number} value - The GPA/CGPA value
 * @returns {string} - Formatted display string
 */
export const formatGPA = (value) => {
  if (value === 0) return '0.00';
  return value.toFixed(2);
};
