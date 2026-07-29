import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizationSettings from './pages/OrganizationSettings';
import DataSources from './pages/DataSources';
import DataChat from './pages/DataChat';
import DashboardOverview from './pages/DashboardOverview';
import KpiDashboard from './pages/KpiDashboard';
import AnomalyTimeline from './pages/AnomalyTimeline';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import RootCauseExplorer from './pages/RootCauseExplorer';
import DataStoryViewer from './pages/DataStoryViewer';
import Collaboration from './pages/Collaboration';
import Reports from './pages/Reports';
import GoalTracker from './pages/GoalTracker';
import InsightMarketplace from './pages/InsightMarketplace';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

import { NavLink } from 'react-router-dom';
import Logo from './components/Logo';
import { 
  LayoutDashboard, Database, MessageSquare, Video, Activity, Bell, 
  TrendingUp, Target, ShoppingBag, Search, Settings, Shield, Compass, Grid, Users, FileText 
} from 'lucide-react';

const NestedNavItem = ({ to, children, badge, badgeColor }: any) => {
  return (
    <div className="relative group">
      {/* Horizontal hook */}
      <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-[12px] h-px bg-border-theme group-hover:bg-muted transition-colors"></div>
      
      <NavLink 
        to={to} 
        end={to === '/dashboard'}
        className={({ isActive }) => 
          `flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 font-medium text-sm ${
            isActive 
              ? 'bg-surface text-main shadow-sm border border-border-theme' 
              : 'text-muted hover:text-main hover:bg-surface/50'
          }`
        }
      >
        <span>{children}</span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
            {badge}
          </span>
        )}
      </NavLink>
    </div>
  );
};

const NavCategory = ({ icon: Icon, title, defaultOpen = true, children }: any) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div className="mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-2 text-main font-semibold text-sm rounded-2xl hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className="text-muted" />}
          {title}
        </div>
        <svg 
          className={`w-4 h-4 text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="relative pb-1">
            {/* Vertical connecting line */}
            <div className="absolute left-[17px] top-0 bottom-3 w-px bg-border-theme"></div>
            <div className="pl-[34px] pr-2 space-y-1 relative">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-main flex font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col h-screen py-8 pl-6 pr-4 overflow-y-auto hide-scrollbar">
        
        {/* Logo */}
        <div className="mb-10 pl-2">
          <Logo size="sm" />
        </div>
        
        {/* Global Search inside sidebar (Dribbble Style) */}
        <div className="mb-8 px-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input type="text" placeholder="Search..." 
              className="w-full bg-surface border border-border-theme rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-accent-indigo/50 focus:shadow-[0_0_10px_rgba(79,70,229,0.1)] transition-all text-main placeholder-muted" />
          </div>
        </div>
        
        {/* Navigation Tree */}
        <nav className="flex-1">
          <div className="mb-4">
            <NavLink 
              to="/dashboard" 
              end
              className={({ isActive }) => 
                `group flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm mb-2 ${
                  isActive 
                    ? 'bg-surface text-main shadow-sm border border-border-theme is-active' 
                    : 'text-muted hover:text-main hover:bg-surface/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard size={18} className={isActive ? 'text-accent-indigo' : 'text-muted'} />
                  Overview
                </>
              )}
            </NavLink>
          </div>

          <NavCategory icon={Database} title="Data Management" defaultOpen={true}>
            <NestedNavItem to="/dashboard/data-sources">Sources</NestedNavItem>
            <NestedNavItem to="/dashboard/collaboration">Collaboration</NestedNavItem>
          </NavCategory>

          <NavCategory icon={Activity} title="Analytics" defaultOpen={true}>
            <NestedNavItem to="/dashboard/reports">Reports</NestedNavItem>
            <NestedNavItem to="/dashboard/kpi">KPI Engine</NestedNavItem>
            <NestedNavItem to="/dashboard/alerts">Smart Alerts</NestedNavItem>
            <NestedNavItem to="/dashboard/predict">Predictive</NestedNavItem>
            <NestedNavItem to="/dashboard/goals">Goal Tracker</NestedNavItem>
          </NavCategory>

          <NavCategory icon={Compass} title="Explore" defaultOpen={false}>
            <NestedNavItem to="/dashboard/chat">Data Chat</NestedNavItem>
            <NestedNavItem to="/dashboard/marketplace">Marketplace</NestedNavItem>
            <NestedNavItem to="/dashboard/root-cause">Root Cause</NestedNavItem>
          </NavCategory>

          <NavCategory icon={Shield} title="Administration" defaultOpen={false}>
            <NestedNavItem to="/dashboard/organization">Settings</NestedNavItem>
            {user?.role === 'SUPER_ADMIN' && (
              <NestedNavItem to="/dashboard/admin">System Admin</NestedNavItem>
            )}
          </NavCategory>
        </nav>

        {/* Bottom Profile & Theme */}
        <div className="mt-8 pt-6 border-t border-border-theme px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-surface border border-border-theme flex items-center justify-center text-accent-primary font-bold uppercase shadow-sm">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-main leading-tight">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-muted font-medium capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</div>
            </div>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-2xl bg-surface border border-border-theme text-muted hover:text-main hover:bg-surface-hover transition-colors shadow-sm"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <button onClick={logout} className="p-2 rounded-2xl text-muted hover:bg-accent-red/10 hover:text-accent-red transition-colors" title="Logout">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content Card Wrapper */}
      <main className="flex-1 h-screen p-4 pl-0 overflow-hidden flex flex-col">
        <div className="flex-1 bg-surface rounded-[2rem] shadow-sm border border-border-theme overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/data-sources" element={<DataSources />} />
              <Route path="/chat" element={<DataChat />} />
              <Route path="/collaboration" element={<Collaboration />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/kpi" element={<KpiDashboard />} />
              <Route path="/alerts" element={<AnomalyTimeline />} />
              <Route path="/predict" element={<PredictiveAnalytics />} />
              <Route path="/goals" element={<GoalTracker />} />
              <Route path="/marketplace" element={<InsightMarketplace />} />
              <Route path="/root-cause" element={<RootCauseExplorer />} />
              <Route path="/story" element={<DataStoryViewer />} />
              <Route path="/organization" element={<OrganizationSettings />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

import AcceptInvite from './pages/AcceptInvite';
import Landing from './pages/Landing';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
