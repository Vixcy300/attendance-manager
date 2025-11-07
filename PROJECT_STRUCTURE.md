# 📁 Project Structure

```
Attendance-manger/
├── public/                          # Static assets
│   └── vite.svg                    # Vite logo
│
├── src/                            # Source code
│   ├── components/                 # React components
│   │   ├── FloatingButtons.jsx    # Floating action buttons
│   │   ├── Header.jsx             # Top navigation header
│   │   ├── Layout.jsx             # Main layout wrapper
│   │   ├── ProtectedRoute.jsx     # Route protection
│   │   ├── QuickCalculator.jsx    # Calculator modal
│   │   └── Sidebar.jsx            # Side navigation
│   │
│   ├── pages/                      # Page components
│   │   ├── Calendar.jsx           # Calendar view
│   │   ├── Courses.jsx            # Course management
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── Disclaimer.jsx         # Disclaimer page
│   │   ├── Feedback.jsx           # Feedback form
│   │   ├── FeedbackHistory.jsx    # Feedback history
│   │   ├── Login.jsx              # Login page
│   │   ├── Profile.jsx            # User profile
│   │   ├── Signup.jsx             # Registration page
│   │   └── Statistics.jsx         # Analytics page
│   │
│   ├── store/                      # State management (Zustand)
│   │   ├── appStore.js            # App-wide state
│   │   ├── authStore.js           # Authentication state
│   │   └── courseStore.js         # Course data state
│   │
│   ├── lib/                        # Libraries & configurations
│   │   └── supabase.js            # Supabase client & DB helpers
│   │
│   ├── utils/                      # Utility functions
│   │   ├── export.js              # PDF/Excel export functions
│   │   └── helpers.js             # Helper functions
│   │
│   ├── App.jsx                     # Main App component
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Global styles
│
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── index.html                      # HTML entry point
├── package.json                    # NPM dependencies
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── vite.config.js                  # Vite configuration
├── vercel.json                     # Vercel deployment config
├── jsconfig.json                   # JavaScript configuration
├── supabase-schema.sql             # Database schema
├── README.md                       # Project documentation
├── SETUP_GUIDE.md                  # Detailed setup guide
└── QUICKSTART.md                   # Quick start guide
```

## 📦 Component Architecture

### Core Components
- **Layout**: Wraps protected routes with Sidebar + Header
- **Sidebar**: Navigation menu with links to all pages
- **Header**: Top bar with user info, dark mode toggle, notifications
- **FloatingButtons**: Floating calculator and feedback buttons
- **QuickCalculator**: Modal calculator with predictions
- **ProtectedRoute**: Authentication guard for routes

### Page Components
- **Dashboard**: Overview with stats and quick actions
- **Courses**: CRUD operations for courses
- **Calendar**: Interactive calendar for attendance marking
- **Statistics**: Charts and analytics
- **Feedback**: Feedback submission form
- **FeedbackHistory**: User's feedback tracking
- **Profile**: User profile management
- **Login/Signup**: Authentication pages
- **Disclaimer**: Important notices

## 🗄️ Database Schema

### Tables
1. **users**: User profiles (extends Supabase auth)
2. **courses**: Course information
3. **attendance_records**: Daily attendance logs
4. **feedback**: User feedback submissions

### Relationships
- users → courses (one-to-many)
- users → attendance_records (one-to-many)
- courses → attendance_records (one-to-many)
- users → feedback (one-to-many)

## 🎨 Styling Architecture

### Tailwind Utilities
- Custom color scheme with primary colors
- Dark mode support with `dark:` prefix
- Responsive breakpoints (sm, md, lg, xl)
- Custom animations and transitions

### CSS Classes
- `.card`: Standard card component
- `.btn-primary`: Primary action button
- `.btn-secondary`: Secondary button
- `.input-field`: Form input styling
- `.badge-*`: Status badges (safe, warning, critical)
- `.floating-btn`: Floating action button
- `.modal-backdrop`: Modal overlay

## 🔄 State Management

### Zustand Stores
1. **authStore**: User authentication & session
2. **courseStore**: Course data & operations
3. **appStore**: UI state (dark mode, modals, calculator)

### Data Flow
```
User Action → Store Action → Supabase API → Update Store → Re-render
```

## 🚀 Build & Deployment

### Development
```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Production (Vercel)
- Automatic deployments from GitHub
- Environment variables in Vercel dashboard
- CDN distribution worldwide
- HTTPS enabled by default

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- JWT-based authentication
- Secure password hashing
- HTTPS-only in production
- Environment variable protection
- CORS configuration

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (base)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: > 1024px (lg)

### Mobile Features
- Hamburger menu for navigation
- Touch-optimized buttons
- Swipe gestures
- Bottom sheets for modals
- Optimized charts for small screens

## 🎯 Performance Optimizations

- Code splitting with React.lazy
- Image optimization
- Lazy loading for routes
- Debounced search/input
- Optimistic UI updates
- Cached Supabase queries

## 🧪 Testing Recommendations

### Manual Testing
1. Authentication flow (signup, login, logout)
2. CRUD operations (courses, attendance)
3. Calculator accuracy
4. Email delivery (feedback)
5. Export functionality (PDF, Excel)
6. Dark mode toggle
7. Responsive behavior

### Browser Compatibility
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

## 📊 Features by Page

### Dashboard
- Overall attendance statistics
- Course cards with progress
- Quick action buttons
- Color-coded status badges

### Courses
- Add/Edit/Delete courses
- Quick attendance marking
- Course cards with circular progress
- Target percentage setting

### Calendar
- Interactive date picker
- Bulk attendance marking
- Color-coded dates
- Notes for specific days

### Statistics
- Course-wise bar charts
- Monthly trend line graphs
- Pie chart distribution
- Detailed table view
- Export reports (PDF/Excel)

### Feedback
- Multi-type feedback forms
- Quick feedback buttons
- Screenshot upload
- Priority settings
- Daily submission limit (3/day)
- Email integration

### Profile
- Edit personal information
- View account stats
- Member since date
- Account type display

## 🔄 Future Enhancements

Potential features to add:
- Push notifications for low attendance
- Bulk import from CSV
- Attendance predictions with ML
- Share reports with peers
- Integration with calendar apps
- Attendance goals and rewards
- Weekly email summaries
- Multiple universities support
- Offline mode with sync

## 📞 Support & Maintenance

### Regular Updates
- Security patches
- Dependency updates
- Bug fixes
- Feature enhancements

### Monitoring
- Supabase dashboard for DB metrics
- Vercel analytics for performance
- Error tracking (optional: Sentry)
- User feedback collection

---

**Last Updated**: November 7, 2025
**Version**: 1.0.0
**Maintained by**: Vignesh (vigneshigt@gmail.com)
