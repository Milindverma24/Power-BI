import * as lucide from 'lucide-react';

const checkIcons = (icons) => {
  const missing = [];
  icons.forEach(icon => {
    if (!lucide[icon]) {
      missing.push(icon);
    }
  });
  return missing;
};

const dashboardIcons = ['LayoutDashboard', 'Loader2', 'PinOff', 'Sparkles', 'X', 'MessageSquare', 'ShieldCheck', 'Send', 'History', 'Download', 'FileText', 'Bot', 'Info', 'Presentation', 'Lightbulb', 'Plus', 'BarChart2', 'BarChart', 'Store', 'ThumbsUp', 'Copy', 'Search', 'Users', 'User', 'ChevronLeft', 'ChevronRight', 'Play', 'Square', 'ChartRenderer', 'Clock'];

console.log("Missing Icons:", checkIcons(dashboardIcons));
