# 🚀 Quick Start - Student Attendance Manager

Get your attendance tracker running in 5 minutes!

## One-Command Install

```bash
npm install
```

## Setup Environment Variables

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Fill in your credentials in `.env`:
   - Get Supabase keys from [supabase.com](https://supabase.com)
   - Get EmailJS keys from [emailjs.com](https://emailjs.com)

## Initialize Database

1. Open [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to SQL Editor
3. Copy-paste contents of `supabase-schema.sql`
4. Run the query

## Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

## 🎯 Quick Test Checklist

After starting the server:

1. ✅ Sign up with a test email
2. ✅ Add a course (e.g., "CS101 - Intro to Programming")
3. ✅ Mark attendance (Present/Absent buttons)
4. ✅ Open Quick Calculator (floating button)
5. ✅ Check Statistics page
6. ✅ Try Calendar view
7. ✅ Send test feedback
8. ✅ Toggle dark mode

## 📦 What's Included

- ✅ Full authentication system
- ✅ Course management with CRUD operations
- ✅ Quick attendance calculator
- ✅ Interactive calendar
- ✅ Statistics with charts
- ✅ Feedback system with email
- ✅ Dark mode
- ✅ Mobile responsive
- ✅ Export to PDF/Excel

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or push to GitHub and import in Vercel dashboard.

## 📚 Documentation

- **Full Setup Guide**: See `SETUP_GUIDE.md`
- **Database Schema**: See `supabase-schema.sql`
- **Project README**: See `README.md`
- **Disclaimer**: See disclaimer page in app

## 🐛 Common Issues

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Failed to fetch" from Supabase
- Check `.env` file has correct Supabase URL and key
- Verify database schema is set up

### Emails not sending
- Verify EmailJS credentials in `.env`
- Check EmailJS template is set up correctly

### Dark mode not persisting
- Clear browser cache
- Check localStorage in browser DevTools

## 💡 Pro Tips

1. **Use dummy data for testing**: Add 5-6 courses with random attendance
2. **Test calculator**: Try different percentages and targets
3. **Export reports**: Test PDF and Excel export features
4. **Mobile view**: Test on your phone using local network IP
5. **Dark mode**: Toggle and check all pages look good

## 📧 Need Help?

- **Documentation**: Check `SETUP_GUIDE.md` for detailed instructions
- **Feedback**: Use in-app feedback form
- **Email**: vigneshigt@gmail.com

## 🎉 You're All Set!

Your Student Attendance Manager is ready to use. Start tracking your attendance efficiently!

---

**Next Steps:**
1. Customize university name and branding
2. Add your actual courses
3. Start marking daily attendance
4. Deploy to production when ready

Happy tracking! 📚✨
