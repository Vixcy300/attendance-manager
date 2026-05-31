const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { scrapeAttendanceData } = require('./scraper');
const { decrypt } = require('./encrypt');
const { sendAttendanceReport } = require('./mailer');

const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');
const CACHE_FILE = path.join(__dirname, 'cache.json');

let cronJob = null;
let lastSyncTime = null;
let syncInProgress = false;

/**
 * Perform active change detection between scraped courses and cached courses
 * @param {Array} newCourses Freshly scraped courses list
 * @param {Array} oldCourses Previously cached courses list
 * @returns {Array} List of changes detected
 */
function detectChanges(newCourses, oldCourses) {
  const changes = [];
  if (!oldCourses || oldCourses.length === 0) return [];

  newCourses.forEach(newCourse => {
    const oldCourse = oldCourses.find(c => c.course_code === newCourse.course_code);
    if (oldCourse) {
      const totalDiff = newCourse.total_classes - oldCourse.total_classes;
      const attendedDiff = newCourse.classes_attended - oldCourse.classes_attended;

      if (totalDiff > 0) {
        // Attendance was marked!
        if (attendedDiff > 0) {
          // Marked Present!
          changes.push({
            course_code: newCourse.course_code,
            course_name: newCourse.course_name,
            type: 'present',
            classes_attended: newCourse.classes_attended,
            total_classes: newCourse.total_classes,
            change_count: attendedDiff
          });
        } else {
          // Marked Absent!
          changes.push({
            course_code: newCourse.course_code,
            course_name: newCourse.course_name,
            type: 'absent',
            classes_attended: newCourse.classes_attended,
            total_classes: newCourse.total_classes,
            change_count: totalDiff
          });
        }
      }
    }
  });

  return changes;
}

/**
 * Core synchronization operation: read credentials, scrape, compare, and email
 */
async function performSync() {
  if (syncInProgress) {
    console.log('[Scheduler] Sync already in progress, skipping.');
    return { success: false, error: 'Sync already in progress' };
  }

  if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.log('[Scheduler] Credentials file not found. Scheduler idle.');
    return { success: false, error: 'Credentials not configured' };
  }

  syncInProgress = true;
  console.log('[Scheduler] Starting background sync check...');

  try {
    const config = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    if (!config.enabled || !config.username || !config.password || !config.email) {
      console.log('[Scheduler] Background sync disabled or missing settings.');
      syncInProgress = false;
      return { success: false, error: 'Scheduler disabled or incomplete configuration' };
    }

    const decryptedPassword = decrypt(config.password);
    if (!decryptedPassword) {
      throw new Error('Failed to decrypt credentials password');
    }

    // Scrape data
    const scrapedCourses = await scrapeAttendanceData(config.username, decryptedPassword);
    
    // Read previous cache
    let cachedCourses = [];
    if (fs.existsSync(CACHE_FILE)) {
      try {
        cachedCourses = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      } catch (err) {
        console.error('[Scheduler] Failed to read cache.json, resetting.', err);
      }
    }

    // Detect attendance state differences
    const changes = detectChanges(scrapedCourses, cachedCourses);
    
    if (changes.length > 0) {
      console.log(`[Scheduler] Detected ${changes.length} attendance updates! Dispatching email...`);
      await sendAttendanceReport(config.email, changes, scrapedCourses);
    } else {
      console.log('[Scheduler] No attendance changes detected today.');
    }

    // Save scraped results to cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(scrapedCourses, null, 2));
    
    lastSyncTime = new Date().toISOString();
    syncInProgress = false;
    console.log('[Scheduler] Background sync finished successfully.');
    return { success: true, changes, lastSync: lastSyncTime };
  } catch (error) {
    console.error('[Scheduler] Critical sync error:', error);
    syncInProgress = false;
    return { success: false, error: error.message };
  }
}

/**
 * Initializes and schedules the background cron task
 */
function initScheduler() {
  // Read schedule settings if exists
  let cronExpression = '0 17 * * *'; // Default to daily at 5:00 PM local
  let enabled = false;

  if (fs.existsSync(CREDENTIALS_FILE)) {
    try {
      const config = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
      enabled = !!config.enabled;
      if (config.cron) {
        cronExpression = config.cron;
      }
    } catch (e) {
      console.error('[Scheduler] Failed to parse scheduler credentials for init', e);
    }
  }

  // Stop previous job if exists
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }

  if (enabled) {
    console.log(`[Scheduler] Scheduling background sync with cron pattern: "${cronExpression}"`);
    cronJob = cron.schedule(cronExpression, async () => {
      console.log('[Scheduler] Triggering scheduled background sync...');
      await performSync();
    });
  } else {
    console.log('[Scheduler] Background sync is currently disabled.');
  }
}

module.exports = {
  performSync,
  initScheduler,
  getSchedulerStatus: () => ({
    enabled: fs.existsSync(CREDENTIALS_FILE) ? JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8')).enabled : false,
    email: fs.existsSync(CREDENTIALS_FILE) ? JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8')).email : null,
    cronPattern: fs.existsSync(CREDENTIALS_FILE) ? (JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8')).cron || '0 17 * * *') : '0 17 * * *',
    lastSync: lastSyncTime,
    inProgress: syncInProgress
  })
};
