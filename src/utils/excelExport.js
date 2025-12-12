import * as XLSX from 'xlsx';

export const exportStudentsToExcel = (students, filename = 'Student_Results.xlsx') => {
  try {
    // Format the data for Excel export
    const formattedData = students.map((student, index) => ({
      'S.No.': index + 1,
      'Register No.': student.registerNumber || 'N/A',
      'Name of the Student': student.username || 'N/A',
      'SEM 1': student.semesters?.find(s => s.semester === 1)?.gpa?.toFixed(2) || 'N/A',
      'SEM 2': student.semesters?.find(s => s.semester === 2)?.gpa?.toFixed(2) || 'N/A',
      'CGPA': student.cgpa ? Number(student.cgpa).toFixed(2) : 'N/A',
      'Total Credits': student.totalCredits || 0,
      'No. of Backlogs': student.backlogs || 0,
      'No. of Arrears': student.arrears || 0
    }));

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Set column widths
    const wscols = [
      { wch: 5 },   // S.No.
      { wch: 15 },  // Register No.
      { wch: 30 },  // Name
      { wch: 10 },  // SEM 1
      { wch: 10 },  // SEM 2
      { wch: 10 },  // CGPA
      { wch: 15 },  // Total Credits
      { wch: 15 },  // No. of Backlogs
      { wch: 15 }   // No. of Arrears
    ];
    ws['!cols'] = wscols;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Student Results');

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};
