import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Link, Snackbar, Alert, Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('token', res.data.token);
      setNotification({ open: true, message: 'Signed in successfully.', severity: 'success' });
      setTimeout(onLogin, 600);
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Invalid credentials. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleGuestLogin = () => {
    localStorage.setItem('token', 'guest');
    onLogin();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9F6F0' }}>
      {/* Left panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 420,
          flexShrink: 0,
          bgcolor: '#101827',
          p: 5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 30, height: 30, borderRadius: '7px', bgcolor: '#14B8A6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
              <path d="M2 9h12M4 9V12h8V9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 9L8 3l7 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#FDFCFA', letterSpacing: '-0.01em' }}>
            RentMate
          </Typography>
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '2rem', color: '#FDFCFA', letterSpacing: '-0.03em', lineHeight: 1.2, mb: 1.5 }}>
            Shared living,<br />simplified.
          </Typography>
          <Typography sx={{ fontSize: '0.9375rem', color: '#6B8C95', lineHeight: 1.65 }}>
            Track rent, split utility bills, and manage shared expenses with your housemates — all in one place.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2.5 }}>
          {[
            { value: '2k+', label: 'Households' },
            { value: '100%', label: 'Free to use' },
            { value: 'Real-time', label: 'Split tracking' },
          ].map(stat => (
            <Box key={stat.label}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#FDFCFA', letterSpacing: '-0.015em' }}>
                {stat.value}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#4A5568', mt: 0.25 }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right: form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: '6px', bgcolor: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 9h12M4 9V12h8V9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 9L8 3l7 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#101827' }}>RentMate</Typography>
          </Box>

          <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#1A2E2D', letterSpacing: '-0.03em', mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: '#4A5568', mb: 3.5 }}>
            Sign in to your account to continue.
          </Typography>

          {/* OAuth */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                borderColor: '#E8E0D5',
                color: '#2D3748',
                bgcolor: '#fff',
                py: 1,
                fontWeight: 500,
                '&:hover': { borderColor: '#DDD5C8', bgcolor: '#FDFCFA' },
              }}
            >
              Continue with Google
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={handleGuestLogin}
              sx={{
                borderColor: '#E8E0D5',
                color: '#4A5568',
                bgcolor: '#fff',
                py: 1,
                fontWeight: 500,
                '&:hover': { borderColor: '#DDD5C8', bgcolor: '#FDFCFA' },
              }}
            >
              Continue as Guest
            </Button>
          </Box>

          <Divider sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#6B8C95', px: 1 }}>or</Typography>
          </Divider>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 0.5, py: 1.125, fontWeight: 600 }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Box>
          </form>

          <Typography sx={{ mt: 2.5, fontSize: '0.875rem', color: '#4A5568', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/signup" sx={{ color: '#14B8A6', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Create account
            </Link>
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(n => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notification.severity} onClose={() => setNotification(n => ({ ...n, open: false }))}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
