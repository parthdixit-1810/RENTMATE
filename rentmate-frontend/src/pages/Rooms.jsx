import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert, Avatar, Chip, IconButton, Divider, CircularProgress
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddHomeIcon from '@mui/icons-material/AddHome';
import api from '../api';

const AVATAR_COLORS = ['#14B8A6', '#1E4D5E', '#D97706', '#E76F51', '#8b5cf6', '#0ea5e9'];
const AVATAR_BG    = ['rgba(20,184,166,0.12)', 'rgba(61,107,125,0.12)', 'rgba(201,164,50,0.12)', 'rgba(231,111,81,0.12)', 'rgba(139,92,246,0.12)', 'rgba(14,165,233,0.12)'];


const getInitials = (name) =>
  name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const fmtINR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

export default function Rooms({ isAuthenticated }) {
  const [roommates, setRoommates] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [openRoommate, setOpenRoommate] = useState(false);
  const [openRoom, setOpenRoom] = useState(false);
  const [success, setSuccess] = useState('');
  const [roommateForm, setRoommateForm] = useState({ name: '', email: '', phone: '', room: '', rent: '' });
  const [roomForm, setRoomForm] = useState({ name: '', size: '', rent: '' });

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingRooms(true);
    api.get('/api/rooms')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setRooms(res.data.map(r => ({
            id: r.id,
            name: r.name || '',
            description: r.description || '',
            size: 0,
            rent: r.rentAmount || 0,
          })));
        }
      })
      .catch(() => { /* keep default data if backend unavailable */ })
      .finally(() => setLoadingRooms(false));
  }, [isAuthenticated]);

  const handleRoommateSubmit = (e) => {
    e.preventDefault();
    setRoommates(prev => [...prev, {
      id: Date.now(),
      name: roommateForm.name,
      room: roommateForm.room || 'Unassigned',
      rent: Number(roommateForm.rent) || 0,
      utilities: 0,
      email: roommateForm.email,
      phone: roommateForm.phone,
    }]);
    setOpenRoommate(false);
    setSuccess('Roommate added successfully.');
    setRoommateForm({ name: '', email: '', phone: '', room: '', rent: '' });
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    const newRoom = {
      name: roomForm.name,
      description: roomForm.description || '',
      rentAmount: Number(roomForm.rent) || 0,
    };
    try {
      const res = await api.post('/api/rooms', newRoom);
      setRooms(prev => [...prev, {
        id: res.data.id,
        name: res.data.name,
        description: res.data.description || '',
        size: 0,
        rent: res.data.rentAmount || 0,
      }]);
    } catch {
      // Optimistic local fallback
      setRooms(prev => [...prev, {
        id: Date.now(),
        name: roomForm.name,
        description: roomForm.description || '',
        size: Number(roomForm.size) || 0,
        rent: Number(roomForm.rent) || 0,
      }]);
    }
    setOpenRoom(false);
    setSuccess('Room added successfully.');
    setRoomForm({ name: '', size: '', rent: '' });
  };

  const removeRoommate = (id) => {
    setRoommates(prev => prev.filter(r => r.id !== id));
    setSuccess('Roommate removed.');
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', p: 4, textAlign: 'center' }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ marginBottom: 20 }}>
          <circle cx="40" cy="40" r="40" fill="#e8eaf6" />
          <circle cx="40" cy="34" r="12" stroke="#c5cae9" strokeWidth="2.5" />
          <path d="M18 68c0-12.1 9.9-22 22-22s22 9.9 22 22" stroke="#c5cae9" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
          Sign in to view rooms
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Please log in to manage your rooms and roommates.
        </Typography>
        <Button variant="contained" href="/login" size="large" sx={{ textTransform: 'none', fontWeight: 700, px: 4 }}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, }}>
      {/* Hero Header */}
      <Box
        sx={{
          mb: 4, p: 3, borderRadius: '16px',
          background: 'linear-gradient(135deg, #101827 0%, #101827 60%, #14B8A622 100%)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(20,184,166,0.18)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#FDFCFA', letterSpacing: '-0.03em' }}>
            Rooms &amp; Roommates
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#6B8C95', mt: 0.5 }}>
            {roommates.length} roommate{roommates.length !== 1 ? 's' : ''} · {rooms.length} rooms
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, position: 'relative' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddHomeIcon sx={{ fontSize: 15 }} />}
            onClick={() => setOpenRoom(true)}
            sx={{ borderColor: 'rgba(255,255,255,0.25)', color: '#CBD5D8', '&:hover': { borderColor: 'rgba(255,255,255,0.45)', bgcolor: 'rgba(255,255,255,0.07)' } }}
          >
            Add Room
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddIcon sx={{ fontSize: 15 }} />}
            onClick={() => setOpenRoommate(true)}
          >
            Add Roommate
          </Button>
        </Box>
      </Box>

      {/* Roommates section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6B8C95' }}>
          Roommates · {roommates.length}
        </Typography>
      </Box>

      {roommates.length === 0 ? (
        <Card sx={{ borderRadius: 3, border: '1px solid #eaeff5', mb: 4 }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto 12px', display: 'block' }}>
              <circle cx="28" cy="28" r="28" fill="#f5f7fa" />
              <circle cx="28" cy="24" r="8" stroke="#c5cae9" strokeWidth="2" />
              <path d="M14 46c0-8.8 6.3-16 14-16s14 7.2 14 16" stroke="#c5cae9" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <Typography variant="body1" color="text.secondary">No roommates yet. Add one to get started.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {roommates.map((rm, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={rm.id}>
              <Card sx={{ overflow: 'hidden', borderTop: `3px solid ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}` }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  {/* Card top with tinted bg */}
                  <Box sx={{ px: 2.5, pt: 2.5, pb: 2, background: `linear-gradient(135deg, ${AVATAR_BG[idx % AVATAR_BG.length]}, transparent 80%)` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: AVATAR_COLORS[idx % AVATAR_COLORS.length], width: 46, height: 46, fontWeight: 800, fontSize: '0.95rem', boxShadow: `0 4px 12px ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}44` }}>
                          {getInitials(rm.name)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1A2E2D', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{rm.name}</Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: '#6B8C95', mt: 0.2, fontWeight: 500 }}>{rm.room}</Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={() => removeRoommate(rm.id)} sx={{ color: '#C8D4D8', '&:hover': { color: '#E76F51', bgcolor: 'rgba(231,111,81,0.08)' }, mt: -0.5, mr: -0.5 }}>
                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Stats row */}
                  <Box sx={{ display: 'flex', px: 2.5, py: 1.75, gap: 3 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#A0B4B8' }}>Rent</Typography>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: AVATAR_COLORS[idx % AVATAR_COLORS.length], letterSpacing: '-0.02em' }}>{fmtINR(rm.rent)}</Typography>
                    </Box>
                    {rm.utilities > 0 && (
                      <Box>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#A0B4B8' }}>Utilities</Typography>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: '#D97706', letterSpacing: '-0.02em' }}>{fmtINR(rm.utilities)}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  <Box sx={{ px: 2.5, py: 1.5 }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#5A6E7F', display: 'block' }}>{rm.email}</Typography>
                    {rm.phone && <Typography sx={{ fontSize: '0.78rem', color: '#6B8C95', mt: 0.25 }}>{rm.phone}</Typography>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Rooms section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#6B8C95' }}>
          Rooms · {rooms.length}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, border: '1px solid #eaeff5', boxShadow: '0 2px 12px rgba(30,34,90,0.06)' }}>
        <Box sx={{ overflow: 'auto' }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <Box component="thead">
              <Box component="tr" sx={{ bgcolor: '#F9F6F0' }}>
                {['Room', 'Size', 'Monthly Rent', 'Occupant'].map(h => (
                  <Box component="th" key={h} sx={{ px: 2.5, py: 1.5, textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #eaeff5' }}>
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {rooms.map((room, idx) => {
                const occupant = roommates.find(r => r.room === room.name);
                return (
                  <Box component="tr" key={room.id} sx={{ '&:not(:last-child) td': { borderBottom: '1px solid #f0f4f8' }, '&:hover': { bgcolor: '#fafbff' } }}>
                    <Box component="td" sx={{ px: 2.5, py: 1.75 }}>
                      <Typography variant="body2" fontWeight={600}>{room.name}</Typography>
                    </Box>
                    <Box component="td" sx={{ px: 2.5, py: 1.75 }}>
                      <Typography variant="body2" color="text.secondary">{room.size > 0 ? `${room.size} sq ft` : '—'}</Typography>
                    </Box>
                    <Box component="td" sx={{ px: 2.5, py: 1.75 }}>
                      {room.rent > 0
                        ? <Typography variant="body2" fontWeight={700} color="primary.main">{fmtINR(room.rent)}</Typography>
                        : <Typography variant="body2" color="text.secondary">—</Typography>
                      }
                    </Box>
                    <Box component="td" sx={{ px: 2.5, py: 1.75 }}>
                      {occupant
                        ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: AVATAR_COLORS[roommates.indexOf(occupant) % AVATAR_COLORS.length], width: 24, height: 24, fontSize: '0.6rem', fontWeight: 700 }}>
                              {getInitials(occupant.name)}
                            </Avatar>
                            <Typography variant="body2">{occupant.name}</Typography>
                          </Box>
                        )
                        : <Typography variant="caption" color="text.disabled">Vacant</Typography>
                      }
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Add Roommate Dialog */}
      <Dialog open={openRoommate} onClose={() => setOpenRoommate(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Roommate</DialogTitle>
        <form onSubmit={handleRoommateSubmit}>
          <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Full Name" fullWidth required value={roommateForm.name} onChange={e => setRoommateForm({ ...roommateForm, name: e.target.value })} size="small" />
            <TextField label="Email" type="email" fullWidth required value={roommateForm.email} onChange={e => setRoommateForm({ ...roommateForm, email: e.target.value })} size="small" />
            <TextField label="Phone Number" fullWidth value={roommateForm.phone} onChange={e => setRoommateForm({ ...roommateForm, phone: e.target.value })} size="small" />
            <TextField label="Room" fullWidth value={roommateForm.room} onChange={e => setRoommateForm({ ...roommateForm, room: e.target.value })} size="small" placeholder="e.g. Master Bedroom" />
            <TextField label="Monthly Rent" type="number" fullWidth value={roommateForm.rent} onChange={e => setRoommateForm({ ...roommateForm, rent: e.target.value })} size="small"
              InputProps={{ startAdornment: <Box component="span" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.9rem' }}>₹</Box> }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenRoommate(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>Add</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={openRoom} onClose={() => setOpenRoom(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Room</DialogTitle>
        <form onSubmit={handleRoomSubmit}>
          <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Room Name" fullWidth required value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })} size="small" />
            <TextField label="Size (sq ft)" type="number" fullWidth value={roomForm.size} onChange={e => setRoomForm({ ...roomForm, size: e.target.value })} size="small" />
            <TextField label="Monthly Rent" type="number" fullWidth value={roomForm.rent} onChange={e => setRoomForm({ ...roomForm, rent: e.target.value })} size="small"
              InputProps={{ startAdornment: <Box component="span" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.9rem' }}>₹</Box> }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenRoom(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" color="secondary" sx={{ textTransform: 'none', fontWeight: 700 }}>Add Room</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
