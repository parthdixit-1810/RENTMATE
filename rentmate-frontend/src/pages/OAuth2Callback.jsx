import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Landing page for /oauth2/callback?token=...&userId=...&name=...
 * Spring redirects here after a successful Google OAuth2 login.
 * We extract the JWT from the query string, persist it, then redirect to dashboard.
 */
export default function OAuth2Callback({ onLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const userId = params.get('userId');
    const name   = params.get('name');
    const error  = params.get('error');

    if (error || !token) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    localStorage.setItem('token', token);
    if (userId) localStorage.setItem('userId', userId);
    if (name)   localStorage.setItem('userName', decodeURIComponent(name));

    onLogin();
    navigate('/dashboard', { replace: true });
  }, [navigate, onLogin]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2 }}>
      <CircularProgress size={40} />
      <Typography variant="body1" color="text.secondary">Signing you in…</Typography>
    </Box>
  );
}
