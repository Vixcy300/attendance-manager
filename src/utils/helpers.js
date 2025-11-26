// Calculate attendance percentage
export const calculatePercentage = (attended, total) => {
  if (total === 0) return 0;
  return ((attended / total) * 100).toFixed(2);
};

// Get status based on percentage
export const getAttendanceStatus = (percentage) => {
  if (percentage >= 75) return 'safe';
  if (percentage >= 65) return 'warning';
  return 'critical';
};

// Get status badge class - now uses target percentage
export const getStatusBadgeClass = (percentage, target = 75) => {
  if (percentage >= target) return 'badge-safe';
  if (percentage >= target - 10) return 'badge-warning';
  return 'badge-critical';
};

// Get status text and icon - now uses target percentage
export const getStatusInfo = (percentage, target = 75) => {
  if (percentage >= target) {
    return { text: 'Safe', icon: '✅', color: 'text-green-600' };
  }
  if (percentage >= target - 10) {
    return { text: 'Warning', icon: '⚠️', color: 'text-yellow-600' };
  }
  return { text: 'Critical', icon: '❌', color: 'text-red-600' };
};

// Calculate classes needed to reach target
export const calculateClassesNeeded = (attended, total, target = 75) => {
  if (total === 0) return 0;
  
  const currentPercentage = (attended / total) * 100;
  if (currentPercentage >= target) return 0;

  // Formula: (attended + x) / (total + x) = target / 100
  // Solving for x: x = (target * total - 100 * attended) / (100 - target)
  const classesNeeded = Math.ceil((target * total - 100 * attended) / (100 - target));
  return Math.max(0, classesNeeded);
};

// Calculate classes can miss
export const calculateClassesCanMiss = (attended, total, target = 75) => {
  if (total === 0) return 0;
  
  const currentPercentage = (attended / total) * 100;
  if (currentPercentage < target) return 0;

  // Formula: (attended) / (total + x) = target / 100
  // Solving for x: x = (100 * attended / target) - total
  const canMiss = Math.floor((100 * attended / target) - total);
  return Math.max(0, canMiss);
};

// Get predictive message
export const getPredictiveMessage = (attended, total, target = 75) => {
  const percentage = parseFloat(calculatePercentage(attended, total));
  
  if (percentage >= target) {
    const canMiss = calculateClassesCanMiss(attended, total, target);
    return `Great! You can miss ${canMiss} more class${canMiss !== 1 ? 'es' : ''} and still maintain ${target}% attendance.`;
  } else {
    const needed = calculateClassesNeeded(attended, total, target);
    return `You need to attend the next ${needed} class${needed !== 1 ? 'es' : ''} consecutively to reach ${target}% attendance.`;
  }
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Get days until target
export const getDaysUntilTarget = (currentPercentage, targetPercentage) => {
  if (currentPercentage >= targetPercentage) return 0;
  const diff = targetPercentage - currentPercentage;
  return Math.ceil(diff / 2); // Approximate
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate university email (optional)
export const isUniversityEmail = (email) => {
  // Add your university domain validation here
  return email.endsWith('.edu') || email.includes('simats');
};

// Get browser info
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  return {
    browser,
    platform: navigator.platform,
    userAgent: ua,
  };
};

// Calculate monthly attendance
export const calculateMonthlyAttendance = (records) => {
  const monthlyData = {};
  
  records.forEach(record => {
    const month = new Date(record.date).toLocaleDateString('en-IN', { month: 'short' });
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, present: 0 };
    }
    monthlyData[month].total++;
    if (record.status === 'present') {
      monthlyData[month].present++;
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    percentage: ((data.present / data.total) * 100).toFixed(1),
    present: data.present,
    total: data.total,
  }));
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate color for course
export const getCourseColor = (index) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
  ];
  return colors[index % colors.length];
};
