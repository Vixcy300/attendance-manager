# 🚀 Brevo Quick Start - 5 Minutes Setup

## ⚡ Super Fast Setup (Follow These Steps)

### Step 1: Sign Up (1 min)
```
1. Go to: https://app.brevo.com/account/register
2. Enter email: vigneshigt@gmail.com
3. Create password
4. Click "Sign up for free"
5. Check email → Click verification link
```

### Step 2: Get API Key (1 min)
```
1. After login, click your NAME (top right)
2. Select "SMTP & API"
3. Click "Generate a new API key"
4. Name it: "Attendance Manager"
5. Click "Generate"
6. COPY the key (starts with: xkeysib-)
```

**Direct Link:** https://app.brevo.com/settings/keys/api

### Step 3: Add to .env File (30 sec)
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_key_here
VITE_BREVO_API_KEY=xkeysib-paste_your_key_here
```

**Save the file!**

### Step 4: Test It (2 min)
```powershell
# Start the server
npm run dev

# Open browser: http://localhost:3000
# Sign up → Go to Feedback page
# Submit test feedback
# Check vigneshigt@gmail.com inbox
```

---

## ✅ That's It!

Your feedback emails will now be sent via **Brevo** to `vigneshigt@gmail.com`

---

## 📸 Visual Guide - Finding API Key

### Where to Click:

```
Brevo Dashboard
│
├─ Click YOUR NAME (top right corner)
│   └─ Dropdown appears
│       └─ Click "SMTP & API"
│
└─ You'll see "API Keys" section
    └─ Click "Generate a new API key"
        └─ Name: "Attendance Manager"
            └─ Click "Generate"
                └─ COPY the key ✅
```

---

## 🎯 What You Get

- ✅ **300 emails per day FREE**
- ✅ Professional email delivery
- ✅ No templates to create
- ✅ Beautiful HTML emails
- ✅ Dashboard to track emails
- ✅ No credit card needed

---

## 📧 Email Format

When user submits feedback, you receive:

```
Subject: [Attendance Manager] Bug Report - Calculator Issue

Body:
┌─────────────────────────────────┐
│ New Feedback Submission         │
├─────────────────────────────────┤
│ User Information                │
│ Name: John Doe                  │
│ Email: john@example.com         │
│ Roll: 21CS001                   │
├─────────────────────────────────┤
│ Feedback Details                │
│ Type: Bug Report                │
│ Priority: High                  │
│ Subject: Calculator Issue       │
│ Categories: Calculator          │
├─────────────────────────────────┤
│ Description                     │
│ [Full user feedback here...]    │
├─────────────────────────────────┤
│ System Info                     │
│ Time: 07/11/2025, 10:30 AM     │
│ Browser: Chrome on Windows      │
└─────────────────────────────────┘
```

---

## 🔧 Troubleshooting

**No email received?**
```
1. Check spam folder
2. Check Brevo dashboard: https://app.brevo.com/statistics/email
3. Verify API key in .env
4. Restart dev server: Ctrl+C → npm run dev
```

**API key error?**
```
1. Key should start with: xkeysib-
2. No spaces or quotes in .env
3. Copy full key from Brevo
```

**Still not working?**
```
Open browser console (F12) and check for errors
```

---

## 🚀 Next Steps

1. ✅ Complete Brevo setup
2. ✅ Test feedback submission
3. ✅ Add courses and test attendance
4. ✅ Deploy to Vercel
5. ✅ Share with friends!

---

**You're ready to go! 🎉**
