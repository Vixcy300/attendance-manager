require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create standard transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Sends a premium-designed HTML email notification for attendance updates.
 * @param {string} toEmail User's notification email address
 * @param {Array} changes List of detected changes
 * @param {Array} allCourses Current updated course list
 */
async function sendAttendanceReport(toEmail, changes, allCourses) {
  if (!toEmail || !changes || changes.length === 0) return;

  // Build changes HTML list
  let changesHtml = '';
  changes.forEach(change => {
    const isPresent = change.type === 'present';
    const badgeBg = isPresent ? '#ecfdf5' : '#fef2f2';
    const badgeTextCol = isPresent ? '#059669' : '#dc2626';
    const badgeBorder = isPresent ? '#10b981' : '#ef4444';
    const badgeText = isPresent ? 'PRESENT' : 'ABSENT';
    const statusDesc = isPresent 
      ? `Attendance marked present (${change.classes_attended}/${change.total_classes})`
      : `Attendance marked absent (${change.classes_attended}/${change.total_classes})`;

    changesHtml += `
      <div style="background-color: #ffffff; border-left: 4px solid ${badgeBorder}; border-top: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 20px; margin-bottom: 16px; border-radius: 8px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">${change.course_code}</span>
          <span style="background-color: ${badgeBg}; color: ${badgeTextCol}; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; letter-spacing: 0.05em;">${badgeText}</span>
        </div>
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 16px; font-weight: 700;">${change.course_name}</h4>
        <p style="margin: 0; color: #475569; font-size: 14px;">${statusDesc}</p>
      </div>
    `;
  });

  // Build entire courses overview list
  let overviewHtml = '<table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 16px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">';
  overviewHtml += `
    <thead>
      <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
        <th style="padding: 12px 16px; color: #475569; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0;">Course</th>
        <th style="padding: 12px 16px; color: #475569; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; border-bottom: 1px solid #e2e8f0;">Attended</th>
        <th style="padding: 12px 16px; color: #475569; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; border-bottom: 1px solid #e2e8f0;">Total</th>
        <th style="padding: 12px 16px; color: #475569; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; text-align: right; border-bottom: 1px solid #e2e8f0;">Attendance %</th>
      </tr>
    </thead>
    <tbody style="background-color: #ffffff;">
  `;

  allCourses.forEach((course, index) => {
    const percentage = course.total_classes > 0 
      ? Math.round((course.classes_attended / course.total_classes) * 100)
      : 100;
    
    let percentColor = '#10b981'; // Green
    if (percentage < 80) {
      percentColor = '#ef4444'; // Red
    }

    const bunkRequired = course.target_percentage || 80;
    let bunkStatusText = '';
    if (percentage >= bunkRequired) {
      const maxBunks = Math.floor((course.classes_attended * 100) / bunkRequired) - course.total_classes;
      bunkStatusText = maxBunks > 0 
        ? `<span style="color: #059669; font-size: 11px; display: block; font-weight: 500; margin-top: 4px;">+${maxBunks} classes safe</span>`
        : `<span style="color: #d97706; font-size: 11px; display: block; font-weight: 500; margin-top: 4px;">Limit Reached</span>`;
    } else {
      const needed = Math.ceil((bunkRequired * course.total_classes - 100 * course.classes_attended) / (100 - bunkRequired));
      bunkStatusText = `<span style="color: #dc2626; font-size: 11px; display: block; font-weight: 500; margin-top: 4px;">Need ${needed} classes</span>`;
    }

    const borderStyle = index !== allCourses.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : '';

    overviewHtml += `
      <tr>
        <td style="padding: 14px 16px; color: #0f172a; font-size: 13px; font-weight: 600; ${borderStyle}">
          ${course.course_name}
          <div style="font-size: 11px; color: #64748b; font-weight: 500; margin-top: 4px;">${course.course_code}</div>
        </td>
        <td style="padding: 14px 16px; color: #334155; font-size: 14px; text-align: center; ${borderStyle}">
          ${course.classes_attended}
        </td>
        <td style="padding: 14px 16px; color: #334155; font-size: 14px; text-align: center; ${borderStyle}">
          ${course.total_classes}
        </td>
        <td style="padding: 14px 16px; text-align: right; font-size: 15px; font-weight: 700; color: ${percentColor}; ${borderStyle}">
          ${percentage}%
          ${bunkStatusText}
        </td>
      </tr>
    `;
  });
  overviewHtml += '</tbody></table>';

  // Load customized email template
  const templatePath = path.join(__dirname, '../email.html');
  let emailHtml = fs.readFileSync(templatePath, 'utf8');

  // Inject dynamic content
  emailHtml = emailHtml.replace('{{changesHtml}}', changesHtml);
  emailHtml = emailHtml.replace('{{overviewHtml}}', overviewHtml);
  
  // Replace image references with CIDs
  emailHtml = emailHtml.replace(/images\//g, 'cid:');

  // Send the email
  const mailOptions = {
    from: `"Attendance Assistant" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `🔔 ARMS Attendance Alert: ${changes.length} New Update(s)!`,
    html: emailHtml,
    attachments: [
      {
        filename: '58459ea2130c2028b7b6fb8127293836.png',
        path: path.join(__dirname, '../images/58459ea2130c2028b7b6fb8127293836.png'),
        cid: '58459ea2130c2028b7b6fb8127293836.png'
      },
      {
        filename: '59f9944ebe18e63281bdcd253928ae24.png',
        path: path.join(__dirname, '../images/59f9944ebe18e63281bdcd253928ae24.png'),
        cid: '59f9944ebe18e63281bdcd253928ae24.png'
      },
      {
        filename: 'b788157aeee49ec22522d96fa1dbb433.png',
        path: path.join(__dirname, '../images/b788157aeee49ec22522d96fa1dbb433.png'),
        cid: 'b788157aeee49ec22522d96fa1dbb433.png'
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * Sends a generic test email to verify SMTP configuration is working correctly.
 */
async function sendTestEmail(toEmail) {
  if (!toEmail) throw new Error('Recipient email is required');

  // Load customized email template for test email as well
  const templatePath = path.join(__dirname, '../email.html');
  let testHtml = fs.readFileSync(templatePath, 'utf8');

  // Inject dynamic content (just some sample texts for the test)
  testHtml = testHtml.replace('{{changesHtml}}', '<div style="background-color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; color: #10b981; font-weight: bold; font-size: 18px;">✅ Alert Service Online</div>');
  testHtml = testHtml.replace('{{overviewHtml}}', '<p style="color: #475569; font-size: 15px; text-align: center;">Your notification settings are perfectly configured. You will now receive highly secure, background attendance updates directly from the Saveetha ARMS Portal.</p>');
  
  // Replace image references with CIDs
  testHtml = testHtml.replace(/images\//g, 'cid:');

  const mailOptions = {
    from: `"Attendance Assistant" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '✅ Attendance Alerts Activated!',
    html: testHtml,
    attachments: [
      {
        filename: '58459ea2130c2028b7b6fb8127293836.png',
        path: path.join(__dirname, '../images/58459ea2130c2028b7b6fb8127293836.png'),
        cid: '58459ea2130c2028b7b6fb8127293836.png'
      },
      {
        filename: '59f9944ebe18e63281bdcd253928ae24.png',
        path: path.join(__dirname, '../images/59f9944ebe18e63281bdcd253928ae24.png'),
        cid: '59f9944ebe18e63281bdcd253928ae24.png'
      },
      {
        filename: 'b788157aeee49ec22522d96fa1dbb433.png',
        path: path.join(__dirname, '../images/b788157aeee49ec22522d96fa1dbb433.png'),
        cid: 'b788157aeee49ec22522d96fa1dbb433.png'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Test email failed:', error);
    throw error;
  }
}

module.exports = { sendAttendanceReport, sendTestEmail };
