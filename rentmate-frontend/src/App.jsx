import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import NavBar from './components/NavBar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Rent from './pages/Rent';
import Utilities from './pages/Utilities';
import Rooms from './pages/Rooms';
import History from './pages/History';
import Notifications from './pages/Notifications';
import FeaturesDemo from './pages/FeaturesDemo';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import OAuth2Callback from './pages/OAuth2Callback';
import Reminders from './pages/Reminders';
import Disputes from './pages/Disputes';
import DepositCalculator from './pages/DepositCalculator';
import AIAssistant from './pages/AIAssistant';

function AuthenticatedApp({ onLogout }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => { window.__navigate = navigate; }, [navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = useMemo(
    () => notifications.filter(n => n.status === 'unread').length,
    [notifications]
  );

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));

  // Auto-close sidebar on mobile when route changes
  React.useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // Sync open state when screen size changes
  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box sx={{ display: 'flex' }}>
      <NavBar
        onLogout={onLogout}
        onMenuToggle={() => setSidebarOpen(o => !o)}
        unreadCount={unreadCount}
      />
      <Sidebar
        open={sidebarOpen}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: '56px',
          transition: 'margin 0.25s ease',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          overflowX: 'hidden',
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rent" element={<Rent />} />
          <Route path="/utilities" element={<Utilities />} />
          <Route path="/rooms" element={<Rooms isAuthenticated />} />
          <Route path="/history" element={<History />} />
          <Route
            path="/notifications"
            element={<Notifications onMarkAllRead={markAllRead} />}
          />
          <Route path="/features-demo" element={<FeaturesDemo />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/disputes" element={<Disputes />} />
          <Route path="/deposit" element={<DepositCalculator />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (new URLSearchParams(window.location.search).get('preview') === '1') {
      sessionStorage.setItem('preview_auth', '1');
    }
    return !!localStorage.getItem('token') || !!sessionStorage.getItem('preview_auth');
  });

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <CssBaseline />
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
          <Route path="/oauth2/callback" element={<OAuth2Callback onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <AuthenticatedApp onLogout={handleLogout} />
      )}
    </Router>
  );
}

export default App;
