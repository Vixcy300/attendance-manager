 Student Attendance Manager (SAM)

A comprehensive web application for students to track and manage their attendance across multiple courses with advanced analytics and intelligent predictions.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

 ⚠️ Important Disclaimer

This is NOT an official college application. Student Attendance Manager (SAM) is an independent student project created for personal attendance tracking. It is not affiliated with, endorsed by, or officially connected to SIMATS Engineering College or any other educational institution.

[Read Full Disclaimer](https://attendance-manger-vignesh.vercel.app/disclaimer)

 🚀 Features

 Core Features
- 🔐 User Authentication: Secure signup/login with Supabase Auth
- 📊 Dashboard Overview: Real-time attendance statistics with color-coded indicators
- 📚 Course Management: Add, edit, delete courses with detailed tracking
- 🧮 Quick Attendance Calculator: Floating calculator widget with real-time predictions
- 📅 Calendar View: Interactive calendar for marking attendance
- 📈 Statistics Dashboard: Visual analytics with charts and graphs
- 💬 Feedback System: Direct feedback submission to developer's email

 Advanced Features
- Smart Predictions: Calculate classes needed to reach target percentage
- Bulk Attendance Marking: Mark multiple courses at once
- Export Reports: Download PDF/Excel attendance reports
- Dark Mode: Full dark mode support
- Responsive Design: Works seamlessly on mobile and desktop
- Real-time Updates: Auto-save and instant data sync

 🛠️ Tech Stack

 Frontend
- React 18 - UI library
- Vite - Build tool
- Tailwind CSS - Styling
- Framer Motion - Animations
- Recharts - Data visualization
- React Router - Navigation
- Lucide React - Icons

 Backend & Services
- Supabase - Backend, database, and authentication
- Brevo (Sendinblue) - Email service for feedback (300 emails/day free)
- Zustand - State management

 Libraries
- jsPDF & jsPDF-AutoTable - PDF export
- XLSX - Excel export
- React Calendar - Calendar component
- React Hot Toast - Notifications
- date-fns - Date formatting

 📦 Installation

 Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account
- EmailJS account (for feedback feature)

 Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/attendance-manager.git
cd attendance-manager
```

 Step 2: Install Dependencies
```bash
npm install
```

 Step 3: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Enable Email Authentication in Authentication settings
4. Get your project URL and anon key from Settings > API

 Step 4: Set Up EmailJS

1. Create account at [emailjs.com](https://www.emailjs.com)
2. Create an email service (Gmail recommended)
3. Create an email template with these variables:
   - `{{from_name}}`, `{{from_email}}`, `{{user_roll}}`
   - `{{feedback_type}}`, `{{subject}}`, `{{description}}`
   - `{{categories}}`, `{{priority}}`, `{{timestamp}}`
   - `{{browser_info}}`
 Step 4: Setup Brevo (Email Service)

1. Go to [Brevo](https://app.brevo.com/account/register)
2. Sign up for a FREE account (no credit card needed)
3. Go to Settings > SMTP & API > API Keys
4. Generate a new API key
5. Copy the API key (starts with `xkeysib-`)

See detailed guide: [BREVO_SETUP_GUIDE.md](./BREVO_SETUP_GUIDE.md)

 Step 5: Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BREVO_API_KEY=xkeysib-your_brevo_api_key
```

 Step 6: Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

 🚀 Deployment

 Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Settings > Environment Variables
5. Deploy!

```bash
 Or use Vercel CLI
npm install -g vercel
vercel
```

 Build for Production
```bash
npm run build
```

The production build will be in the `dist` folder.

 📱 Usage Guide

 For Students

1. Sign Up: Create account with university email
2. Add Courses: Add all your courses with course code and name
3. Track Attendance: 
   - Use quick Present/Absent buttons on course cards
   - Or use Calendar view for detailed tracking
4. Use Calculator: Click floating calculator button for quick calculations
5. View Statistics: Check charts and trends in Statistics page
6. Export Reports: Download PDF or Excel reports anytime
7. Send Feedback: Use feedback button to report bugs or suggest features

 Quick Calculator Features
- Input total classes and classes attended
- Set custom target percentage (default 80%)
- See real-time attendance percentage
- Calculate classes needed to reach target
- Calculate classes you can safely miss
- Save to database as new course
- Share results

 🎨 Customization

 Change Color Theme
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '4A90E2', // Change this
  },
}
```

 Change University Name
Edit the default in:
- `src/pages/Signup.jsx`
- `src/lib/supabase.js`
- Database schema

 🔒 Security & Privacy

- ✅ All data encrypted at rest (Supabase)
- ✅ Row Level Security (RLS) enabled
- ✅ User data isolated - you can only see your own data
- ✅ No data sharing with third parties
- ✅ Secure authentication with email verification
- ✅ Session management with auto-logout

 🐛 Known Issues

- Calendar may not display correctly in some older browsers
- PDF export might have alignment issues with long course names
- Dark mode toggle needs page refresh in some cases

 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

 📧 Contact

Developer: Vignesh  
Email: vigneshigt@gmail.com  
Project Type: Student Portfolio Project

For questions, bug reports, or feature requests, use the in-app feedback form or email directly.

 📄 License

This project is open source and available under the [MIT License](LICENSE).

 🙏 Acknowledgments

- Built as a student project to solve real attendance tracking problems
- Inspired by the need for better attendance management tools
- Thanks to all students who provided feedback and suggestions

 📸 Screenshots

 Dashboard =[Dashboard](https://drive.google.com/file/d/1P42VVp-RifqsNahI588uOzMS2Yf-aztL/view?usp=sharing)

 Quick Calculator =[Calculator](https://drive.google.com/file/d/11pveSADL9YCYvt98s1VhJZRJyRwRUYXQ/view?usp=sharing)

 Statistics =[Statistics](https://drive.google.com/file/d/1d9Nz7LBmKLWzhoEGLpdiu5be8auzaE8Y/view?usp=sharing)

---

Note: This is a student project and not affiliated with any educational institution. Use responsibly and always verify attendance with official college systems.

Made with ❤️ by a student for students
