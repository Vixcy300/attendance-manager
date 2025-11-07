# 🚀 Brevo (Sendinblue) Setup Guide

## Why Brevo?
- ✅ **300 emails/day FREE** (vs EmailJS 200/month)
- ✅ No credit card required
- ✅ Simple API key setup (no templates needed!)
- ✅ Professional email delivery
- ✅ Works with any email address

---

## Step 1: Create Brevo Account (2 minutes)

1. **Go to Brevo website:**
   - Open: https://app.brevo.com/account/register

2. **Sign up for FREE account:**
   - Enter your email: `vigneshigt@gmail.com` (or any email)
   - Create a password
   - Click "Sign up for free"

3. **Verify your email:**
   - Check your inbox for verification email
   - Click the verification link

4. **Complete profile (optional):**
   - You can skip the onboarding questions
   - Or fill basic info and click "Continue"

---

## Step 2: Get Your API Key (1 minute)

1. **Navigate to API Keys:**
   - After login, you'll see the dashboard
   - Click on your **name** (top right corner)
   - Select **"SMTP & API"** from dropdown
   - OR directly go to: https://app.brevo.com/settings/keys/api

2. **Create API Key:**
   - You'll see a section called **"API Keys"**
   - Click **"Generate a new API key"** button
   - Give it a name: `Attendance Manager` or `Production`
   - Click **"Generate"**

3. **Copy the API Key:**
   - A long key will appear (looks like: `xkeysib-xxxxxxxxxxxxx`)
   - Click the **Copy** button
   - **IMPORTANT:** Save this somewhere safe! You can't see it again.
   - It should look like: `xkeysib-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

---

## Step 3: Update .env File (30 seconds)

1. **Open your `.env` file** in the project folder

2. **Fill in the values:**

```env
# SUPABASE CONFIGURATION (You already have these)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# BREVO CONFIGURATION (Add this)
VITE_BREVO_API_KEY=xkeysib-your_actual_api_key_here
```

3. **Example of filled .env:**

```env
VITE_SUPABASE_URL=https://abcdefghij.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_BREVO_API_KEY=xkeysib-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

4. **Save the file** (Ctrl + S)

---

## Step 4: Test the Application (2 minutes)

### Start the Development Server:

```powershell
npm run dev
```

### Test Feedback System:

1. Open: http://localhost:3000
2. **Sign up** with a test account
3. Navigate to **"Feedback"** page
4. Fill out a test feedback:
   - Type: Bug Report
   - Subject: "Test feedback email"
   - Description: "This is a test to check if Brevo email is working correctly!"
   - Click **Submit Feedback**

5. **Check your email:**
   - Go to `vigneshigt@gmail.com` inbox
   - You should receive a nicely formatted email with:
     - User information
     - Feedback details
     - System information
   - Email arrives in **less than 5 seconds!**

---

## 🎯 What Happens When User Submits Feedback?

1. Feedback is saved to **Supabase database**
2. Email is sent via **Brevo API** to `vigneshigt@gmail.com`
3. User sees success message
4. Email contains:
   - User name, email, roll number
   - Feedback type, priority, subject
   - Full description
   - Categories selected
   - Timestamp and browser info
   - Feedback ID for tracking

---

## 📧 Email Preview

When someone submits feedback, you'll receive an email like this:

```
Subject: [Attendance Manager] Bug Report - Test feedback email

From: Attendance Manager <noreply@attendancemanager.app>
To: vigneshigt@gmail.com

-----------------------------------
New Feedback Submission

User Information:
Name: John Doe
Email: john@example.com
Roll Number: 21CS001

Feedback Details:
Type: Bug Report
Priority: High
Subject: Calculator not showing correct percentage
Categories: Dashboard, Calculator

Description:
When I add attendance for CS101, the calculator shows 
wrong percentage. It should show 75% but displays 73%.

System Information:
Timestamp: 07/11/2025, 10:30:45 AM
Browser: Chrome on Windows

-----------------------------------
Feedback ID: 550e8400-e29b-41d4-a716-446655440000
```

---

## 🔧 Troubleshooting

### Issue: "API key is invalid"
**Solution:**
- Make sure you copied the **full API key** from Brevo
- It should start with `xkeysib-`
- No spaces or quotes in `.env` file
- Restart dev server after changing `.env`

### Issue: "Emails not arriving"
**Solution:**
1. Check **Brevo dashboard** > **Statistics** to see if email was sent
2. Check your **spam folder**
3. Verify `vigneshigt@gmail.com` is correct in `Feedback.jsx`
4. Make sure you have API credits (300/day free)

### Issue: "CORS error"
**Solution:**
- Brevo API works directly from browser, no CORS issues
- If you see CORS error, check if API key is correct

### Issue: "Rate limit exceeded"
**Solution:**
- Free plan: 300 emails/day
- Daily limit resets at midnight UTC
- Upgrade to paid plan for more emails

---

## 📊 Brevo Dashboard - Monitor Emails

### View Sent Emails:
1. Go to: https://app.brevo.com/statistics/email
2. You'll see:
   - Total emails sent today
   - Delivery rate
   - Open rate (if HTML tracking enabled)

### Check API Usage:
1. Go to: https://app.brevo.com/settings/keys/api
2. See remaining daily credits: `X/300 sent today`

---

## 🚀 Deploy to Production (Vercel)

When you deploy to Vercel, add the environment variable:

1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add:
   - Key: `VITE_BREVO_API_KEY`
   - Value: `xkeysib-your_actual_api_key`
5. Redeploy the project

---

## 💡 Benefits vs EmailJS

| Feature | Brevo | EmailJS |
|---------|-------|---------|
| Free Emails | 300/day (9,000/month) | 200/month |
| Setup Complexity | Just API key | Service + Template + Public Key |
| Email Delivery | Professional SMTP | Third-party relay |
| Dashboard Analytics | ✅ Yes | Limited |
| HTML Emails | ✅ Full control | Template-based |
| Price for Upgrade | €25/month (20k emails) | $35/month (10k emails) |

---

## 🎉 You're All Set!

Now your feedback system is powered by **Brevo** - a professional email service used by millions of companies!

**Next Steps:**
1. ✅ Test feedback submission
2. ✅ Check email arrives at vigneshigt@gmail.com
3. ✅ Customize email template if needed
4. ✅ Deploy to Vercel

**Need Help?**
- Brevo Support: https://help.brevo.com/
- API Documentation: https://developers.brevo.com/docs

---

**Happy coding! 🚀**
