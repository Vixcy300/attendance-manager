# 🎓 Student Attendance Manager - Complete Setup Guide

This guide will walk you through setting up the Student Attendance Manager from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Brevo Setup](#brevo-setup)
4. [Local Development](#local-development)
5. [Deployment to Vercel](#deployment-to-vercel)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:
- ✅ Node.js 16+ installed ([Download](https://nodejs.org/))
- ✅ Git installed ([Download](https://git-scm.com/))
- ✅ A code editor (VS Code recommended)
- ✅ A GitHub account
- ✅ A Supabase account (free tier works)
- ✅ A Brevo account (free - 300 emails/day)

---

## Supabase Setup

### Step 1: Create a New Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: `attendance-manager` (or your choice)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
6. Click "Create new project" (takes ~2 minutes)

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste into the editor
5. Click "Run" or press Ctrl+Enter
6. You should see "Success. No rows returned"

### Step 3: Configure Authentication

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Go to **Authentication** > **URL Configuration**
4. Add these URLs (replace with your domain):
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/**`

### Step 4: Get API Keys

1. Go to **Settings** > **API**
2. Copy these values (you'll need them):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (looks like: `eyJhbGciOiJIUzI1NiIs...`)

---

## Brevo Setup

**For detailed step-by-step guide with screenshots, see:** [BREVO_SETUP_GUIDE.md](./BREVO_SETUP_GUIDE.md)

### Quick Steps:

1. **Create Account:**
   - Go to https://app.brevo.com/account/register
   - Sign up with email: `vigneshigt@gmail.com`
   - Verify your email

2. **Get API Key:**
   - Click your name (top right) → "SMTP & API"
   - Click "Generate a new API key"
   - Name: "Attendance Manager"
   - Copy the key (starts with `xkeysib-`)

3. **Save the API Key:**
   - You'll add this to `.env` file in the next section

---
Name: {{from_name}}
Email: {{from_email}}
Roll Number: {{user_roll}}

-----------------------------------
FEEDBACK DETAILS
-----------------------------------
Type: {{feedback_type}}
Subject: {{subject}}
Priority: {{priority}}
Categories: {{categories}}

Description:
{{description}}

-----------------------------------
SYSTEM INFORMATION
-----------------------------------
Timestamp: {{timestamp}}
Browser/Device: {{browser_info}}

-----------------------------------

This feedback was submitted through Student Attendance Manager.
```

4. Click "Save"
5. **Copy the Template ID** (looks like: `template_xxxxx`)

### Step 4: Get Public Key

1. Go to **Account** > **General**
2. Find **Public Key** section
3. **Copy the Public Key** (looks like: `xxx-xxxxxxxxx`)

---

## Local Development

### Step 1: Clone and Install

```bash
# Navigate to your project folder
cd Attendance-manger

# Install dependencies
npm install
```

### Step 2: Create Environment File

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_BREVO_API_KEY=xkeysib-your-api-key-here
```

Replace all values with your actual keys from Supabase and Brevo.

### Step 3: Start Development Server

```bash
npm run dev
```

The app should open at `http://localhost:3000`

### Step 4: Test the Application

1. **Sign Up**: Create a test account
2. **Check Email**: Verify the confirmation email works
3. **Add Course**: Test adding a course
4. **Use Calculator**: Test the quick calculator
5. **Send Feedback**: Test the feedback form
6. **Check Email**: Verify feedback email arrives at vigneshigt@gmail.com

---

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Student Attendance Manager"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/your-username/attendance-manager.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: dist

### Step 3: Add Environment Variables

In Vercel project settings:

1. Go to **Settings** > **Environment Variables**
2. Add each variable:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_BREVO_API_KEY`: Your Brevo API key
3. Click "Save"

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment (takes ~2 minutes)
3. You'll get a URL like: `https://your-project.vercel.app`

---

## Post-Deployment

### Step 1: Update Supabase URLs

1. Go to Supabase **Authentication** > **URL Configuration**
2. Update:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/**`

### Step 2: Test Production

1. Visit your Vercel URL
2. Sign up with a real email
3. Verify all features work:
   - ✅ Authentication
   - ✅ Course management
   - ✅ Calculator
   - ✅ Calendar
   - ✅ Statistics
   - ✅ Feedback submission
   - ✅ Dark mode
   - ✅ Mobile responsiveness

### Step 3: Custom Domain (Optional)

1. In Vercel, go to **Settings** > **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase URLs with your custom domain

---

## Troubleshooting

### Issue: White screen after deployment
**Solution**: Check browser console for errors. Usually missing environment variables.

### Issue: "Failed to fetch" errors
**Solution**: Verify Supabase URL and anon key are correct in environment variables.

### Issue: Email verification not working
**Solution**: Check Supabase Authentication > Email Templates are enabled.

### Issue: Feedback emails not arriving
**Solution**: 
- Verify EmailJS credentials
- Check spam folder
- Test EmailJS template directly from their dashboard

### Issue: Dark mode not working
**Solution**: Clear browser cache and reload page.

### Issue: Calendar not displaying
**Solution**: Ensure `react-calendar/dist/Calendar.css` is imported in Calendar.jsx.

### Issue: Charts not showing
**Solution**: Install recharts: `npm install recharts`

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service identifier | `service_abc123` |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template identifier | `template_xyz789` |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public API key | `abc-12345678` |

---

## Additional Configuration

### Change Default Target Percentage

Edit `src/store/appStore.js`:
```javascript
targetPercentage: 75, // Change to your desired default
```

### Change University Name

Edit `src/pages/Signup.jsx`:
```javascript
university: 'Your University Name',
```

### Customize Colors

Edit `tailwind.config.js`:
```javascript
primary: {
  500: '#4A90E2', // Your brand color
}
```

---

## Need Help?

- **Bug Reports**: Use the in-app feedback form
- **Email**: vigneshigt@gmail.com
- **Documentation**: Check README.md

---

## Security Checklist

Before going live:
- ✅ Environment variables set in Vercel
- ✅ RLS policies enabled in Supabase
- ✅ Email verification enabled
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ API keys not in code
- ✅ `.env` file in `.gitignore`

---

**Congratulations! 🎉** Your Student Attendance Manager is now live!

Visit your app and start tracking attendance!
