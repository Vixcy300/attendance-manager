require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { scrapeAttendanceData } = require('./scraper');
const { encrypt } = require('./encrypt');
const { sendTestEmail } = require('./mailer');
const { initScheduler, performSync, getSchedulerStatus } = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 5000;
const CREDENTIALS_FILE = path.join(__dirname, 'credentials.json');

app.use(cors());
app.use(express.json());

// On-demand scraper trigger (manual frontend import)
app.post('/api/sync', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const courses = await scrapeAttendanceData(username, password);
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ error: error.message || 'Failed to sync data from the portal' });
  }
});

// Configure and save automation schedule
app.post('/api/config/schedule', (req, res) => {
  const { username, password, email, enabled, cron } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and notification email are required' });
  }

  try {
    // Encrypt the password before storing on disk
    const encryptedPassword = encrypt(password);
    
    const configData = {
      username,
      password: encryptedPassword,
      email,
      enabled: !!enabled,
      cron: cron || '0 17 * * *' // Default to 5:00 PM local time daily
    };

    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(configData, null, 2));
    
    // Reinitialize background cron schedule
    initScheduler();

    res.json({ success: true, message: 'Automation schedule saved and activated' });
  } catch (error) {
    console.error('Schedule config error:', error);
    res.status(500).json({ error: 'Failed to save schedule configuration' });
  }
});

// Trigger an immediate manual run of the background sync (with change email alert)
app.post('/api/config/run-now', async (req, res) => {
  try {
    const result = await performSync();
    if (result.success) {
      res.json({ success: true, changes: result.changes, lastSync: result.lastSync });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Manual run error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute manual sync check' });
  }
});

// Rate limiting helper for test email (10 times a day per email)
function checkTestEmailRateLimit(email) {
  const RATE_LIMIT_FILE = path.join(__dirname, 'rate_limit.json');
  let data = {};
  if (fs.existsSync(RATE_LIMIT_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, 'utf8'));
    } catch (e) {
      data = {};
    }
  }

  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  if (!data[today]) {
    data[today] = {};
  }

  const count = data[today][email] || 0;
  if (count >= 10) {
    return { allowed: false, count };
  }

  data[today][email] = count + 1;
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
  return { allowed: true, count: count + 1 };
}

// Send a test email to verify SMTP credentials
app.post('/api/config/test-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Notification email is required' });
  }

  // Enforce rate limit (10 test emails per day per email address)
  const limitCheck = checkTestEmailRateLimit(email);
  if (!limitCheck.allowed) {
    return res.status(429).json({ error: 'Daily limit exceeded. You can only send 10 test emails per day.' });
  }

  try {
    await sendTestEmail(email);
    res.json({ success: true, message: `Test email dispatched to ${email}` });
  } catch (error) {
    console.error('Test email API error:', error);
    res.status(500).json({ error: error.message || 'Failed to send test email' });
  }
});

// Get scheduler status and config metadata
app.get('/api/config/status', (req, res) => {
  try {
    const status = getSchedulerStatus();
    
    let emailAddress = null;
    let isScheduled = false;
    let username = null;
    let password = null;
    
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const config = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
      emailAddress = config.email;
      isScheduled = !!config.enabled;
      username = config.username;
      
      const { decrypt } = require('./encrypt');
      password = decrypt(config.password);
    }

    res.json({
      success: true,
      scheduler: {
        ...status,
        email: emailAddress,
        enabled: isScheduled,
        username,
        password
      }
    });
  } catch (error) {
    console.error('Fetch status error:', error);
    res.status(500).json({ error: 'Failed to retrieve scheduler status' });
  }
});

// Initialize background scheduler on startup
initScheduler();

app.listen(PORT, () => {
  console.log(`Backend Sync Server running on http://localhost:${PORT}`);
});
