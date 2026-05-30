import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Box, IconButton, Menu, MenuItem,
  Avatar, Divider, Badge, Tooltip, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Typography, Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Settings,
  Person,
  NotificationsNone as NotificationsIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function NavBar({ onLogout, onMenuToggle, unreadCount = 0 }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [householdAnchor, setHouseholdAnchor] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [currentHousehold, setCurrentHousehold] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rm_current_household') || 'null'); } catch { return null; }
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/api/households/my')
      .then(res => {
        setHouseholds(res.data || []);
        if (res.data?.length > 0 && !currentHousehold) {
          setCurrentHousehold(res.data[0]);
          localStorage.setItem('rm_current_household', JSON.stringify(res.data[0]));
        }
      })
      .catch(() => {});
  }, []);

  const switchHousehold = async (h) => {
    try { await api.put(`/api/households/switch/${h.id}`); } catch {}
    setCurrentHousehold(h);
    localStorage.setItem('rm_current_household', JSON.stringify(h));
    setHouseholdAnchor(null);
  };

  const handleCreateHousehold = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/households', { name: createName });
      const h = res.data;
      setHouseholds(prev => [...prev, h]);
      setCurrentHousehold(h);
      localStorage.setItem('rm_current_household', JSON.stringify(h));
    } catch {}
    setOpenCreate(false);
    setCreateName('');
  };

  const handleJoinHousehold = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/households/join', { code: joinCode });
      const h = res.data;
      setHouseholds(prev => prev.some(x => x.id === h.id) ? prev : [...prev, h]);
      setCurrentHousehold(h);
      localStorage.setItem('rm_current_household', JSON.stringify(h));
    } catch {}
    setOpenJoin(false);
    setJoinCode('');
  };

  const handleLogout = () => {
    setAnchorEl(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    onLogout();
  };

  const userInitial = (localStorage.getItem('userName') || 'U')[0].toUpperCase();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: '#101827',
        color: '#fff',
        zIndex: (t) => t.zIndex.drawer + 1,
        borderBottom: 'none',
        borderRadius: 0,
        boxShadow: 'none',
        width: '100%',
        left: 0,
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: { xs: 1.5, sm: 2 }, gap: 1 }}>
        {/* Hamburger */}
        <IconButton
          onClick={onMenuToggle}
          size="small"
          sx={{ color: 'rgba(255,255,255,0.6)', mr: 0.5 }}
        >
          <MenuIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1, flex: { xs: 1, md: 0 } }}>
          <Box sx={{ width: 26, height: 26, borderRadius: '6px', bgcolor: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2 9h12M4 9V12h8V9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 9L8 3l7 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff', letterSpacing: '-0.01em', display: { xs: 'block' } }}>
            RentMate
          </Typography>
        </Box>

        {/* Spacer for desktop */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, flex: 1 }} />

        {/* Household switcher */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <Button
            size="small"
            onClick={e => setHouseholdAnchor(e.currentTarget)}
            endIcon={<ExpandMoreIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />}
            sx={{
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 500,
              fontSize: '0.8125rem',
              px: 1.5,
              py: 0.5,
              bgcolor: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)' },
              maxWidth: 200,
            }}
          >
            <Typography
              noWrap
              sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', maxWidth: 130 }}
            >
              {currentHousehold?.name ?? 'No household'}
            </Typography>
          </Button>

          <Menu
            anchorEl={householdAnchor}
            open={Boolean(householdAnchor)}
            onClose={() => setHouseholdAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: { mt: 1, minWidth: 220, p: 0.5 },
            }}
          >
            <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
              <Typography variant="overline" sx={{ fontSize: '0.65rem', color: '#6B8C95', fontWeight: 600, letterSpacing: '0.08em' }}>
                Households
              </Typography>
            </Box>
            {households.length === 0 && (
              <MenuItem disabled sx={{ fontSize: '0.8125rem', color: '#6B8C95' }}>
                No households yet
              </MenuItem>
            )}
            {households.map(h => (
              <MenuItem
                key={h.id}
                onClick={() => switchHousehold(h)}
                selected={currentHousehold?.id === h.id}
                sx={{ borderRadius: '5px', mx: 0 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#101827' }}>
                    {h.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#6B8C95', flexShrink: 0 }}>
                    {h.memberCount} {h.memberCount === 1 ? 'member' : 'members'}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => { setHouseholdAnchor(null); setOpenCreate(true); }} sx={{ borderRadius: '5px' }}>
              <AddIcon sx={{ fontSize: 15, mr: 1, color: '#14B8A6' }} />
              <Typography sx={{ fontSize: '0.875rem', color: '#14B8A6', fontWeight: 500 }}>
                Create household
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => { setHouseholdAnchor(null); setOpenJoin(true); }} sx={{ borderRadius: '5px' }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#2D3748', ml: 3 }}>
                Join with code
              </Typography>
            </MenuItem>
          </Menu>
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications" arrow>
          <IconButton
            size="small"
            onClick={() => navigate('/notifications')}
            sx={{ color: 'rgba(255,255,255,0.7)', ml: 0.5, '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}
          >
            <Badge
              badgeContent={unreadCount || null}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.6rem',
                  height: 14,
                  minWidth: 14,
                  padding: 0,
                },
              }}
            >
              <NotificationsIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Avatar / profile */}
        <Tooltip title="Account" arrow>
          <IconButton
            onClick={e => setAnchorEl(e.currentTarget)}
            size="small"
            sx={{ ml: 0.25 }}
          >
            <Avatar
              sx={{
                bgcolor: '#14B8A6',
                width: 28,
                height: 28,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {userInitial}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Toolbar>

      {/* Profile menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { mt: 1, minWidth: 172, p: 0.5 } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }} sx={{ borderRadius: '5px' }}>
          <Person sx={{ mr: 1.5, fontSize: 16, color: '#4A5568' }} />
          <Typography sx={{ fontSize: '0.875rem' }}>Profile</Typography>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }} sx={{ borderRadius: '5px' }}>
          <Settings sx={{ mr: 1.5, fontSize: 16, color: '#4A5568' }} />
          <Typography sx={{ fontSize: '0.875rem' }}>Settings</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ borderRadius: '5px' }}>
          <Logout sx={{ mr: 1.5, fontSize: 16, color: '#dc2626' }} />
          <Typography sx={{ fontSize: '0.875rem', color: '#dc2626' }}>Sign out</Typography>
        </MenuItem>
      </Menu>

      {/* Create Household Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Household</DialogTitle>
        <form onSubmit={handleCreateHousehold}>
          <DialogContent>
            <TextField
              label="Household name"
              fullWidth
              required
              autoFocus
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              placeholder="e.g. Flat 4B, Koramangala"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Join Household Dialog */}
      <Dialog open={openJoin} onClose={() => setOpenJoin(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Join Household</DialogTitle>
        <form onSubmit={handleJoinHousehold}>
          <DialogContent>
            <TextField
              label="Invite code"
              fullWidth
              required
              autoFocus
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="8-character code"
              inputProps={{ maxLength: 8 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenJoin(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Join</Button>
          </DialogActions>
        </form>
      </Dialog>
    </AppBar>
  );
}

export default NavBar;
