require('dotenv').config();
const nodemailer = require('nodemailer');

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
    const badgeColor = isPresent ? '#10b981' : '#f43f5e';
    const badgeText = isPresent ? 'PRESENT ✅' : 'ABSENT 🚨';
    const statusDesc = isPresent 
      ? `You were marked present! Classes: <b>${change.classes_attended}/${change.total_classes}</b>`
      : `You were marked absent! Classes: <b>${change.classes_attended}/${change.total_classes}</b>`;

    changesHtml += `
      <div style="background-color: #1e293b; border-left: 4px solid ${badgeColor}; padding: 16px; margin-bottom: 12px; border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">${change.course_code}</span>
          <span style="background-color: ${badgeColor}22; color: ${badgeColor}; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 9999px; border: 1px solid ${badgeColor}44;">${badgeText}</span>
        </div>
        <h4 style="margin: 0 0 6px 0; color: #f8fafc; font-size: 16px;">${change.course_name}</h4>
        <p style="margin: 0; color: #cbd5e1; font-size: 13px;">${statusDesc}</p>
      </div>
    `;
  });

  // Build entire courses overview list
  let overviewHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 16px;">';
  overviewHtml += `
    <thead>
      <tr style="border-bottom: 1px solid #334155; text-align: left;">
        <th style="padding: 8px; color: #94a3b8; font-size: 12px;">Course</th>
        <th style="padding: 8px; color: #94a3b8; font-size: 12px; text-align: center;">Attended</th>
        <th style="padding: 8px; color: #94a3b8; font-size: 12px; text-align: center;">Total</th>
        <th style="padding: 8px; color: #94a3b8; font-size: 12px; text-align: right;">Attendance %</th>
      </tr>
    </thead>
    <tbody>
  `;

  allCourses.forEach(course => {
    const percentage = course.total_classes > 0 
      ? Math.round((course.classes_attended / course.total_classes) * 100)
      : 100;
    
    let percentColor = '#10b981'; // Green (80%+)
    if (percentage < 80) {
      percentColor = '#f43f5e'; // Red (< 80%)
    }

    // Calculate bunk limit
    const bunkRequired = course.target_percentage || 80;
    let bunkStatusText = '';
    if (percentage >= bunkRequired) {
      const maxBunks = Math.floor((course.classes_attended * 100) / bunkRequired) - course.total_classes;
      bunkStatusText = maxBunks > 0 
        ? `<span style="color: #10b981; font-size: 11px; display: block;">Can bunk ${maxBunks} classes</span>`
        : `<span style="color: #eab308; font-size: 11px; display: block;">Limit reached (0 bunks)</span>`;
    } else {
      const needed = Math.ceil((bunkRequired * course.total_classes - 100 * course.classes_attended) / (100 - bunkRequired));
      bunkStatusText = `<span style="color: #f43f5e; font-size: 11px; display: block;">Attend next ${needed} classes</span>`;
    }

    overviewHtml += `
      <tr style="border-bottom: 1px solid #1e293b;">
        <td style="padding: 10px 8px; color: #f8fafc; font-size: 13px; font-weight: 500;">
          ${course.course_name}
          <div style="font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px;">${course.course_code}</div>
        </td>
        <td style="padding: 10px 8px; color: #e2e8f0; font-size: 13px; text-align: center;">${course.classes_attended}</td>
        <td style="padding: 10px 8px; color: #e2e8f0; font-size: 13px; text-align: center;">${course.total_classes}</td>
        <td style="padding: 10px 8px; text-align: right; font-size: 13px; font-weight: bold; color: ${percentColor};">
          ${percentage}%
          ${bunkStatusText}
        </td>
      </tr>
    `;
  });
  overviewHtml += '</tbody></table>';

  // Compose gorgeous premium HTML email layout
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ARMS Attendance Notification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b0f19; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
                  <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #f8fafc; letter-spacing: -0.025em; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                    <span style="color: #6366f1;">ARMS</span> Live Attendance Sync
                  </h2>
                  <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">Automated 5:00 PM Portal Sync Alert</p>
                </td>
              </tr>
              
              <!-- Content Body -->
              <tr>
                <td style="padding: 24px;">
                  <h3 style="margin: 0 0 16px 0; color: #f8fafc; font-size: 18px; border-bottom: 2px solid #334155; padding-bottom: 8px;">
                    🔔 Attendance Updates Detected
                  </h3>
                  
                  ${changesHtml}
                  
                  <h3 style="margin: 32px 0 12px 0; color: #f8fafc; font-size: 18px; border-bottom: 2px solid #334155; padding-bottom: 8px;">
                    📊 Complete Attendance Summary
                  </h3>
                  <p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8;">Required Attendance threshold: <b>80%</b> globally.</p>
                  
                  ${overviewHtml}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #020617; padding: 20px 24px; text-align: center; border-top: 1px solid #1e293b;">
                  <p style="margin: 0; font-size: 11px; color: #475569; line-height: 1.5;">
                    This is an automated background alert generated by your Local Attendance Manager.<br>
                    Saveetha ARMS portal connection was securely opened, parsed, and logged out in 20 seconds.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Send the email
  const mailOptions = {
    from: `"Attendance Assistant" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `🔔 ARMS Attendance Alert: ${changes.length} New Update(s)!`,
    html: emailHtml
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

  const testHtml = `
    <div style="background-color: #0f172a; color: #f8fafc; font-family: sans-serif; padding: 32px; border-radius: 8px; border: 1px solid #1e293b; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #6366f1; margin-top: 0;">✅ Alert Service Activated!</h2>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Congratulations! Your email notification settings are correctly configured. You will now receive background updates from the <b>Saveetha ARMS Attendance Portal</b> daily at 5:00 PM.
      </p>
      <hr style="border-color: #1e293b; margin: 20px 0;">
      <p style="color: #64748b; font-size: 11px;">
        Local Sync Server Running Successfully.
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Attendance Assistant" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '✅ Attendance Alerts Activated!',
    html: testHtml
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
