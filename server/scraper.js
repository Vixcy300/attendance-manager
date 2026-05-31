const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

/**
 * Scrapes attendance data using a headless browser to handle logins.
 * NOTE: For safety reasons, placeholder URLs are used. 
 * Replace 'https://portal.example.edu/login' with your actual login URL.
 */
async function scrapeAttendanceData(username, password) {
  let browser;
  try {
    // Launch headless browser
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Optimize by blocking images, fonts, and stylesheets
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 1. Navigate to the Login Page
    // TODO: REPLACE THIS URL WITH YOUR ACTUAL COLLEGE LOGIN URL (e.g. https://arms.sse.saveetha.com)
    const LOGIN_URL = 'https://arms.sse.saveetha.com/';
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });

    // 2. Perform Login using precise Saveetha portal selectors
    await page.waitForSelector('#txtusername', { visible: true });
    await page.type('#txtusername', username);
    await page.type('#txtpassword', password);
    
    // Click submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('#btnlogin')
    ]);

    // 3. Navigate to Attendance Report Page
    // TODO: REPLACE THIS URL WITH YOUR ACTUAL ATTENDANCE REPORT URL
    const ATTENDANCE_URL = 'https://arms.sse.saveetha.com/StudentPortal/AttendanceReport.aspx';
    await page.goto(ATTENDANCE_URL, { waitUntil: 'networkidle2' });

    // 4. Extract HTML content
    const htmlContent = await page.content();
    
    // 5. Parse data using Cheerio (similar to DOMParser)
    const $ = cheerio.load(htmlContent);
    const courses = [];
    
    // Find the table that contains "Course Code" and "Class Attended"
    let targetTable = null;
    $('table').each((i, table) => {
      const headerText = $(table).find('tr').first().text().toLowerCase();
      if (headerText.includes('course code') && headerText.includes('class attended')) {
        targetTable = table;
      }
    });

    if (!targetTable) {
      throw new Error('Attendance table not found on the resulting page. Login might have failed.');
    }

    // Determine column indices
    const headers = [];
    $(targetTable).find('tr').first().find('th, td').each((i, el) => {
      headers.push($(el).text().trim().toLowerCase());
    });

    const codeIdx = headers.findIndex(h => h.includes('course code'));
    const nameIdx = headers.findIndex(h => h.includes('course name'));
    const attendedIdx = headers.findIndex(h => h === 'class attended' || h === 'attended class' || h === 'attended');
    const totalIdx = headers.findIndex(h => h === 'total class' || h === 'class total' || h === 'total');

    if (codeIdx === -1 || attendedIdx === -1 || totalIdx === -1) {
      throw new Error('Table structure does not match expected format.');
    }

    // Parse rows
    $(targetTable).find('tr').each((i, row) => {
      if (i === 0) return; // Skip header

      const cells = $(row).find('td');
      if (cells.length > Math.max(codeIdx, nameIdx, attendedIdx, totalIdx)) {
        const courseCode = $(cells[codeIdx]).text().trim();
        const courseName = nameIdx !== -1 ? $(cells[nameIdx]).text().trim() : '';
        const classesAttended = parseInt($(cells[attendedIdx]).text().trim(), 10);
        const totalClasses = parseInt($(cells[totalIdx]).text().trim(), 10);

        if (courseCode && !isNaN(classesAttended) && !isNaN(totalClasses)) {
          courses.push({
            course_code: courseCode,
            course_name: courseName || courseCode,
            classes_attended: classesAttended,
            total_classes: totalClasses,
            target_percentage: 80,
          });
        }
      }
    });

    return courses;
  } catch (error) {
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeAttendanceData };
