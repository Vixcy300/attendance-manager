# 🔧 Troubleshooting Guide

Common issues and solutions for Student Attendance Manager.

---

## Installation Issues

### ❌ "npm install" fails

**Solution 1: Clear cache**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution 2: Use different registry**
```bash
npm install --registry=https://registry.npmjs.org/
```

**Solution 3: Check Node version**
```bash
node --version  # Should be 16 or higher
npm --version   # Should be 8 or higher
```

### ❌ Dependency conflicts

**Solution:**
```bash
npm install --legacy-peer-deps
```

---

## Development Server Issues

### ❌ "npm run dev" doesn't start

**Check 1: Port already in use**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in vite.config.js
server: { port: 3001 }
```

**Check 2: Environment variables**
- Ensure .env file exists
- Verify all variables are set
- No quotes around values
- No spaces in values

**Check 3: File permissions**
```bash
# Windows: Run as administrator
# Check if folder is not read-only
```

### ❌ White/blank screen after start

**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Common issues:
   - Missing environment variables
   - Incorrect Supabase URL
   - Module import errors

**Fix:**
```bash
# Rebuild
npm run build
npm run preview
```

---

## Supabase Issues

### ❌ "Failed to fetch" errors

**Check:**
1. Supabase URL is correct in .env
2. Anon key is correct and not expired
3. Project is not paused (free tier pauses after 1 week inactivity)

**Fix:**
```bash
# Verify in browser console:
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

### ❌ Database queries not working

**Solution 1: Check RLS policies**
1. Go to Supabase Dashboard > Authentication > Policies
2. Ensure all tables have policies enabled
3. Re-run supabase-schema.sql if needed

**Solution 2: Check table structure**
```sql
-- Run in SQL Editor
SELECT * FROM users LIMIT 1;
SELECT * FROM courses LIMIT 1;
SELECT * FROM attendance_records LIMIT 1;
SELECT * FROM feedback LIMIT 1;
```

### ❌ Authentication not working

**Check:**
1. Email provider is enabled in Supabase
2. Redirect URLs are set correctly
3. Email templates are active

**Fix:**
- Supabase > Authentication > Providers > Enable Email
- Supabase > Authentication > URL Configuration > Add your URLs

---

## EmailJS Issues

### ❌ Feedback emails not sending

**Check 1: EmailJS credentials**
```javascript
// Verify in browser console
console.log(import.meta.env.VITE_EMAILJS_SERVICE_ID)
console.log(import.meta.env.VITE_EMAILJS_TEMPLATE_ID)
console.log(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
```

**Check 2: Email template**
- Go to EmailJS dashboard
- Check template has all required variables
- Test template directly from dashboard

**Check 3: Service connection**
- EmailJS > Email Services
- Verify Gmail is connected
- Reconnect if needed

**Check 4: Spam folder**
- Check spam/junk in vigneshigt@gmail.com
- Add no-reply@emailjs.com to contacts

**Check 5: Daily limits**
- Free tier: 200 emails/month
- Check usage in EmailJS dashboard

---

## UI/Display Issues

### ❌ Dark mode not working

**Solution 1: Clear browser data**
```bash
# Clear localStorage
localStorage.clear()
```

**Solution 2: Force dark mode**
```javascript
// In browser console
document.documentElement.classList.add('dark')
```

**Solution 3: Check persistence**
- Zustand persist middleware might fail
- Clear browser cache
- Try incognito mode

### ❌ Charts not displaying

**Check 1: Data exists**
- Add at least 2-3 courses with attendance
- Mark some attendance in calendar

**Check 2: Recharts installed**
```bash
npm install recharts
```

**Check 3: Browser console**
- Look for Recharts errors
- Check if data prop is valid

### ❌ Calendar not showing

**Check 1: CSS imported**
```javascript
// In Calendar.jsx
import 'react-calendar/dist/Calendar.css';
```

**Check 2: Package installed**
```bash
npm install react-calendar
```

### ❌ Responsive design broken on mobile

**Solution:**
1. Clear browser cache
2. Force reload (Ctrl+Shift+R)
3. Check viewport meta tag in index.html
4. Try different mobile browser

---

## Export Issues

### ❌ PDF export not working

**Check:**
```bash
npm install jspdf jspdf-autotable
```

**Browser compatibility:**
- Works best on Chrome/Edge
- Safari might have issues
- Try desktop browser if mobile fails

### ❌ Excel export not working

**Check:**
```bash
npm install xlsx
```

**Browser security:**
- Allow downloads in browser settings
- Check popup blocker
- Try incognito mode

---

## Authentication Issues

### ❌ Email verification not received

**Solution:**
1. Check spam folder
2. Wait 5-10 minutes (email delay)
3. Verify Supabase email templates are enabled
4. Try different email address

### ❌ "Invalid login credentials"

**Common causes:**
- Wrong email/password
- Account not verified
- Password too short (min 6 chars)

**Fix:**
1. Use "Forgot Password" link
2. Check email for reset link
3. Create new account if needed

### ❌ Session expires too quickly

**Solution:**
```javascript
// In src/lib/supabase.js
// Adjust session timeout (default: 1 hour)
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});
```

---

## Build/Deploy Issues

### ❌ Build fails with errors

**Solution 1: Check imports**
- All components imported correctly
- No circular dependencies
- Case-sensitive file names

**Solution 2: Clear build cache**
```bash
rm -rf dist node_modules .vite
npm install
npm run build
```

**Solution 3: Check for TypeScript errors**
- Even though it's JavaScript, some packages use TypeScript
- Install type definitions if needed

### ❌ Vercel deployment fails

**Check 1: Environment variables**
- All variables added in Vercel dashboard
- No typos in variable names
- Values are correct

**Check 2: Build settings**
- Framework: Vite
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install

**Check 3: Node version**
- Vercel uses Node 18 by default
- Specify version in package.json if needed

**Check 4: Logs**
- Check deployment logs in Vercel
- Look for specific error messages

---

## Performance Issues

### ❌ App loading slowly

**Solution 1: Check network**
- Slow Supabase queries
- Large database
- Poor internet connection

**Solution 2: Optimize images**
- Compress screenshots
- Use proper image formats

**Solution 3: Reduce data**
- Limit initial data load
- Implement pagination

### ❌ Calculator slow to respond

**Solution:**
- Add debouncing to inputs
- Already implemented in utils/helpers.js
- Reduce calculations per keystroke

---

## Database Issues

### ❌ Data not saving

**Check 1: RLS policies**
```sql
-- Check policies
SELECT * FROM pg_policies;
```

**Check 2: User authentication**
- Ensure user is logged in
- Check auth.uid() returns valid ID

**Check 3: Network**
- Check Supabase project status
- Verify internet connection

### ❌ Data not updating in real-time

**Solution:**
- Refresh page
- Supabase doesn't support real-time on free tier for all features
- Manual refresh is required

---

## Browser Compatibility

### Known Issues

**Safari:**
- Some CSS animations might not work
- LocalStorage might be restricted
- Use Chrome/Firefox for best experience

**Internet Explorer:**
- ❌ Not supported (use modern browser)

**Mobile Browsers:**
- ✅ Chrome Mobile - Full support
- ✅ Safari iOS - Full support
- ✅ Firefox Mobile - Full support
- ⚠️ Samsung Internet - Mostly supported

---

## Common Error Messages

### "Cannot read property of undefined"
**Cause:** Data not loaded yet
**Fix:** Add loading states and null checks

### "Network Error"
**Cause:** Supabase unreachable or CORS issue
**Fix:** Check Supabase URL and internet connection

### "Invalid API key"
**Cause:** Wrong Supabase anon key
**Fix:** Double-check .env file

### "Rate limit exceeded"
**Cause:** Too many requests to Supabase
**Fix:** Wait a few minutes, implement request throttling

### "Module not found"
**Cause:** Missing dependency
**Fix:** `npm install <missing-package>`

---

## Still Having Issues?

### Steps to Get Help

1. **Check browser console** (F12)
   - Look for error messages
   - Check network tab
   - Verify API calls

2. **Check Supabase logs**
   - Dashboard > Logs
   - Look for failed queries

3. **Verify environment**
   - Node version: `node --version`
   - NPM version: `npm --version`
   - All .env variables set

4. **Try fresh install**
   ```bash
   rm -rf node_modules package-lock.json .vite dist
   npm install
   npm run dev
   ```

5. **Use feedback form**
   - Report bug with details
   - Include error messages
   - Describe steps to reproduce

6. **Email support**
   - vigneshigt@gmail.com
   - Include error screenshots
   - Describe what you tried

---

## Debug Mode

Enable verbose logging:

```javascript
// In src/main.jsx
if (import.meta.env.DEV) {
  console.log('🚀 App starting...');
  console.log('Environment:', import.meta.env);
}
```

---

## Useful Commands

```bash
# Clear everything and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Update all packages (be careful!)
npm update

# Audit security issues
npm audit
npm audit fix

# Check bundle size
npm run build
# Check dist folder size

# Test production build locally
npm run preview
```

---

## Emergency Reset

If nothing works:

```bash
# 1. Backup .env file
copy .env .env.backup

# 2. Delete everything except source
rm -rf node_modules package-lock.json dist .vite

# 3. Fresh install
npm install

# 4. Restore .env
copy .env.backup .env

# 5. Try again
npm run dev
```

---

## Contact Support

If you're still stuck after trying these solutions:

**Email:** vigneshigt@gmail.com

**Include:**
- ✅ Error message (screenshot)
- ✅ Browser and version
- ✅ Operating system
- ✅ What you were trying to do
- ✅ What you've already tried
- ✅ Console errors (F12)

**Response time:** Usually within 24-48 hours

---

Remember: Most issues are caused by:
1. Missing environment variables (50%)
2. Supabase configuration (30%)
3. Browser cache (10%)
4. Package installation (10%)

Always check these first! 🔍
