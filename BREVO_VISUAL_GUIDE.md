# 🎯 STEP-BY-STEP: Get Brevo API Key

## Visual Guide with Exact Steps

---

## Step 1: Go to Brevo
```
🌐 Open browser and go to:
https://app.brevo.com/account/register
```

---

## Step 2: Sign Up Form
```
┌─────────────────────────────────────┐
│  📧 Email: vigneshigt@gmail.com     │
│  🔒 Password: [create strong one]   │
│  ☑️  I agree to terms               │
│  [ Sign up for free ]               │
└─────────────────────────────────────┘

Click "Sign up for free"
```

---

## Step 3: Verify Email
```
📧 Check your inbox (vigneshigt@gmail.com)

Subject: "Verify your Brevo account"

Click the verification link in the email
```

---

## Step 4: After Login
```
You'll see the Brevo Dashboard

Look at TOP RIGHT CORNER:
┌─────────────────────────────┐
│  [Your Name] ▼              │  ← Click here
└─────────────────────────────┘

Dropdown menu appears:
├─ Dashboard
├─ Settings
├─ SMTP & API  ← Click this
├─ Billing
└─ Logout
```

---

## Step 5: SMTP & API Page
```
You'll see this page:

┌──────────────────────────────────────┐
│  SMTP & API                          │
├──────────────────────────────────────┤
│                                      │
│  API Keys                            │
│  ────────────────                    │
│                                      │
│  Manage your API keys to access     │
│  Brevo's API                         │
│                                      │
│  [ + Generate a new API key ]       │  ← Click this button
│                                      │
└──────────────────────────────────────┘
```

---

## Step 6: Create API Key
```
A popup appears:

┌────────────────────────────────┐
│  Create an API key             │
├────────────────────────────────┤
│                                │
│  Name your API key:            │
│  ┌──────────────────────────┐ │
│  │ Attendance Manager       │ │  ← Type this
│  └──────────────────────────┘ │
│                                │
│  [ Cancel ]  [ Generate ]     │  ← Click Generate
└────────────────────────────────┘
```

---

## Step 7: Copy API Key
```
SUCCESS! Your API key is created:

┌─────────────────────────────────────────────────────────┐
│  ✅ API key created successfully                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your API key (keep it secret):                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │ xkeysib-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7...    │ │
│  │                                            [Copy] │ │  ← Click Copy
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ⚠️  This key will only be shown once!                 │
│                                                         │
│  [ Done ]                                              │
└─────────────────────────────────────────────────────────┘

IMPORTANT: Click "Copy" button now!
```

---

## Step 8: Paste in .env File
```
1. Open your project folder:
   C:\Users\vigne\OneDrive\Desktop\Attendance-manger

2. Open .env file

3. Find this line:
   VITE_BREVO_API_KEY=

4. Paste your API key after the = sign:
   VITE_BREVO_API_KEY=xkeysib-a1b2c3d4e5f6g7h8i9j0...

5. Save the file (Ctrl + S)
```

---

## ✅ Done! Your Complete .env File

```env
# SUPABASE (you should already have these)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# BREVO (you just got this)
VITE_BREVO_API_KEY=xkeysib-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
```

---

## 🚀 Now Start the App!

```powershell
npm run dev
```

Wait for:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

Then open: **http://localhost:3000**

---

## 🎯 Quick Test

1. **Click "Sign Up"**
   - Name: Test User
   - Email: test@example.com
   - Password: Test@123
   - Click "Sign Up"

2. **Add a Course**
   - Course Code: CS101
   - Course Name: Data Structures
   - Click "Add Course"

3. **Mark Attendance**
   - Click "Present" or "Absent"
   - See percentage update

4. **Try Calculator**
   - Click blue floating button (bottom right)
   - Enter numbers
   - See predictions

5. **Send Test Feedback**
   - Click "Feedback" in menu
   - Fill form
   - Submit
   - **Check vigneshigt@gmail.com inbox!**

---

## 📸 What You Should See

### Brevo API Keys Page:
```
URL: https://app.brevo.com/settings/keys/api

Page shows:
• Your API keys list
• Generate new API key button
• API documentation link
• Usage statistics
```

### API Key Format:
```
Starts with: xkeysib-
Length: ~60 characters
Example: xkeysib-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## 🆘 Troubleshooting

### Can't find "SMTP & API" option?
```
Alternative path:
1. Click gear icon (⚙️) in top right
2. Select "SMTP & API"

Or direct URL:
https://app.brevo.com/settings/keys/api
```

### "Generate" button not working?
```
1. Make sure you're logged in
2. Verify email is confirmed
3. Try different browser (Chrome/Edge)
4. Clear cache and reload
```

### Lost API key?
```
Don't worry! Just generate a new one:
1. Go to API keys page
2. Click "Generate a new API key"
3. Give it a different name: "Attendance Manager 2"
4. Copy and use the new key
```

### API key not working in app?
```
Check:
1. Copied FULL key (all characters)
2. No spaces before/after in .env
3. No quotes around the key
4. Saved .env file
5. Restarted dev server (Ctrl+C, then npm run dev)
```

---

## ✅ Checklist

Complete these in order:

- [ ] Opened https://app.brevo.com/account/register
- [ ] Signed up with vigneshigt@gmail.com
- [ ] Verified email (checked inbox)
- [ ] Logged into Brevo dashboard
- [ ] Clicked name → "SMTP & API"
- [ ] Clicked "Generate a new API key"
- [ ] Named it "Attendance Manager"
- [ ] Clicked "Generate"
- [ ] Clicked "Copy" button
- [ ] Opened .env file in project
- [ ] Pasted API key after VITE_BREVO_API_KEY=
- [ ] Saved .env file
- [ ] Ready to run `npm run dev`

---

## 🎉 You're Ready!

Once all boxes are checked above, run:

```powershell
npm run dev
```

And open: **http://localhost:3000**

**Enjoy your Student Attendance Manager! 🚀**
