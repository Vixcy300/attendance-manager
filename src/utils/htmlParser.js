/**
 * Parses a saved HTML file from the university portal to extract attendance data.
 * @param {string} htmlContent - The raw HTML text
 * @returns {Array} Array of course objects
 */
export const parsePortalHTML = (htmlContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const courses = [];

  // Find all tables in the document
  const tables = doc.querySelectorAll('table');
  let targetTable = null;

  // Search for the table containing "Course Code" and "Class Attended"
  tables.forEach((table) => {
    const headerRow = table.querySelector('tr');
    if (headerRow) {
      const headerText = headerRow.textContent.toLowerCase();
      if (headerText.includes('course code') && headerText.includes('class attended')) {
        targetTable = table;
      }
    }
  });

  if (!targetTable) {
    throw new Error('Could not find the attendance table in the provided HTML file. Please ensure it is the correct page.');
  }

  // Determine column indices dynamically
  const headerRow = targetTable.querySelector('tr');
  const headers = Array.from(headerRow.querySelectorAll('th, td')).map(h => h.textContent.trim().toLowerCase());
  
  const codeIdx = headers.findIndex(h => h.includes('course code'));
  const nameIdx = headers.findIndex(h => h.includes('course name'));
  const attendedIdx = headers.findIndex(h => h === 'class attended' || h === 'attended class' || h === 'attended');
  const totalIdx = headers.findIndex(h => h === 'total class' || h === 'class total' || h === 'total');

  if (codeIdx === -1 || attendedIdx === -1 || totalIdx === -1) {
    throw new Error('Table structure does not match expected format.');
  }

  // Iterate over rows (skipping the header row)
  const rows = targetTable.querySelectorAll('tr');
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.querySelectorAll('td');
    
    if (cells.length > Math.max(codeIdx, nameIdx, attendedIdx, totalIdx)) {
      const courseCode = cells[codeIdx]?.textContent.trim();
      const courseName = nameIdx !== -1 ? cells[nameIdx]?.textContent.trim() : '';
      const classesAttended = parseInt(cells[attendedIdx]?.textContent.trim(), 10);
      const totalClasses = parseInt(cells[totalIdx]?.textContent.trim(), 10);

      if (courseCode && !isNaN(classesAttended) && !isNaN(totalClasses)) {
        courses.push({
          course_code: courseCode,
          course_name: courseName || courseCode,
          classes_attended: classesAttended,
          total_classes: totalClasses,
          target_percentage: 80, // Default globally agreed upon
        });
      }
    }
  }

  return courses;
};
