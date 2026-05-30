import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Box, Typography, Card, CardContent, CircularProgress,
  Alert, Avatar, Divider, Button, TextField, Snackbar
} from '@mui/material';

function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [success, setSuccess] = useState('');

  const isGuest = !localStorage.getItem('token');

  useEffect(() => {
    if (isGuest) {
      setUser({ name: 'Guest', email: 'guest@rentmate.app', role: 'Guest' });
      setLoading(false);
      return;
    }
    api.get('/api/auth/me')
      .then(res => {
        setUser(res.data);
        setEditForm({ name: res.data.name || '', email: res.data.email || '' });
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load profile.');
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/auth/me', editForm);
      setUser(u => ({ ...u, ...editForm }));
      setEditing(false);
      setSuccess('Profile updated.');
    } catch {
      setError('Failed to save changes.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={28} thickness={4} sx={{ color: '#14B8A6' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3.5, md: 4 }, }}>

      {/* Hero header */}
      <Box
        sx={{
          mb: 3.5, p: 3.5, borderRadius: '16px',
          background: 'linear-gradient(135deg, #101827 0%, #101827 60%, #14B8A633 100%)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', gap: 2.5,
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(20,184,166,0.15)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <Avatar
          sx={{
            background: 'linear-gradient(135deg, #14B8A6, #0E9688)',
            width: 64, height: 64, fontSize: '1.375rem', fontWeight: 800,
            boxShadow: '0 4px 16px rgba(20,184,166,0.40)',
            border: '3px solid rgba(255,255,255,0.15)',
            position: 'relative',
          }}
        >
          {getInitials(user?.name)}
        </Avatar>
        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.375rem', color: '#FDFCFA', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            {user?.name || 'Guest'}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#6B8C95', mt: 0.35 }}>
            {user?.email}
          </Typography>
          <Box
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.5,
              mt: 0.75, px: 1, py: 0.25,
              borderRadius: '20px',
              bgcolor: isGuest ? 'rgba(251,191,36,0.18)' : 'rgba(20,184,166,0.18)',
              border: `1px solid ${isGuest ? 'rgba(251,191,36,0.30)' : 'rgba(20,184,166,0.30)'}`,
            }}
          >
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: isGuest ? '#FBBF24' : '#14B8A6' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: isGuest ? '#FBBF24' : '#14B8A6', letterSpacing: '0.04em' }}>
              {isGuest ? 'GUEST' : 'MEMBER'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>{error}</Alert>}

      {isGuest && (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          You're browsing as a guest. Create an account to save your data.
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 } }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6B8C95', mb: 2.5 }}>
            Account Details
          </Typography>

          {editing ? (
            <form onSubmit={handleSave}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Full name" fullWidth value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                <TextField label="Email address" type="email" fullWidth value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                <Box sx={{ display: 'flex', gap: 1, pt: 0.5 }}>
                  <Button variant="contained" type="submit">Save changes</Button>
                  <Button onClick={() => setEditing(false)}>Cancel</Button>
                </Box>
              </Box>
            </form>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Full name', value: user?.name || '-' },
                  { label: 'Email address', value: user?.email || '-' },
                  { label: 'Account type', value: isGuest ? 'Guest' : 'Registered' },
                ].map((row, i, arr) => (
                  <Box key={row.label}>
                    <Box sx={{ py: 2 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#A0B4B8', mb: 0.5 }}>
                        {row.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.9375rem', color: '#1A2E2D', fontWeight: 600, letterSpacing: '-0.005em' }}>
                        {row.value}
                      </Typography>
                    </Box>
                    {i < arr.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
              {!isGuest && (
                <Button variant="outlined" onClick={() => setEditing(true)} sx={{ mt: 3 }}>
                  Edit profile
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar open={!!success} autoHideDuration={3500} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
