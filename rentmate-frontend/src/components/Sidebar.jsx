import React from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Box, Typography, Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  ElectricBolt as ElectricBoltIcon,
  Group as GroupIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 232;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Rent', icon: <HomeIcon />, path: '/rent' },
  { text: 'Utilities', icon: <ElectricBoltIcon />, path: '/utilities' },
  { text: 'Rooms', icon: <GroupIcon />, path: '/rooms' },
  { text: 'History', icon: <HistoryIcon />, path: '/history' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' },
];

function Sidebar({ open, isMobile = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(180deg, #101827 0%, #101827 40%, #101827 100%)',
      }}
    >
      {/* Nav items */}
      <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
        {menuItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: '6px',
                  py: 0.875,
                  px: 1.25,
                  bgcolor: active ? 'rgba(20,184,166,0.20)' : 'transparent',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    bgcolor: active ? 'rgba(20,184,166,0.28)' : 'rgba(255,255,255,0.07)',
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: active ? '#14B8A6' : '#5B8A95',
                    '& svg': { fontSize: 18 },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#E0F5F3' : '#7AA8B4',
                    letterSpacing: '-0.01em',
                  }}
                />
                {active && (
                  <Box
                    sx={{
                      width: 2, height: 16, borderRadius: 1,
                      bgcolor: '#14B8A6', ml: 0.5, flexShrink: 0,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid #101827' }}>
        <Typography sx={{ fontSize: '0.7rem', color: '#5B8A95', letterSpacing: '0.04em' }}>
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: isMobile ? '4px 0 24px rgba(0,0,0,0.25)' : 'none',
          top: isMobile ? 0 : '56px',
          height: isMobile ? '100%' : 'calc(100% - 56px)',
          borderRadius: 0,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default Sidebar;
