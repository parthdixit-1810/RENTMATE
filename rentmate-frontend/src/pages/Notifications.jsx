import React, { useState } from 'react';
import {
  Box, Typography, Switch, Button, Divider, Snackbar, Alert,
} from '@mui/material';
import {
  Home as HomeIcon,
  ElectricBolt as ElectricBoltIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
  NotificationsNone as BellIcon,
} from '@mui/icons-material';

const TYPE_CONFIG = {
  rent_due:         { Icon: HomeIcon,         iconBg: 'linear-gradient(135deg,#14B8A622,#14B8A611)', iconColor: '#14B8A6', dot: '#E76F51' },
  utility_unpaid:   { Icon: ElectricBoltIcon, iconBg: 'linear-gradient(135deg,#E76F5122,#E76F5111)', iconColor: '#C45030', dot: '#E76F51' },
  utility_due:      { Icon: ElectricBoltIcon, iconBg: 'linear-gradient(135deg,#FBBF2422,#FBBF2411)', iconColor: '#D97706', dot: '#FBBF24' },
  payment_received: { Icon: PaymentIcon,       iconBg: 'linear-gradient(135deg,#14B8A622,#14B8A611)', iconColor: '#14B8A6', dot: '#14B8A6' },
};

const INITIAL = [
  { id: 1, type: 'rent_due',         title: 'Rent Payment Due',    message: 'Monthly rent payment of ₹12,000 is due in 3 days',    date: '2024-01-28', priority: 'high',   status: 'unread' },
  { id: 2, type: 'utility_unpaid',   title: 'Utility Bill Overdue',message: 'Internet bill of ₹1,200 is overdue by 5 days',        date: '2024-01-10', priority: 'high',   status: 'unread' },
  { id: 3, type: 'payment_received', title: 'Payment Received',    message: 'John Doe has paid their rent share of ₹4,800',        date: '2024-01-15', priority: 'low',    status: 'read'   },
  { id: 4, type: 'rent_due',         title: 'Rent Reminder',       message: "Jane Smith's rent payment of ₹3,600 is due in 1 week",date: '2024-01-24', priority: 'medium', status: 'unread' },
  { id: 5, type: 'utility_due',      title: 'Water Bill Due',      message: 'Water bill of ₹800 is due in 2 days',                 date: '2024-01-18', priority: 'medium', status: 'unread' },
  { id: 6, type: 'payment_received', title: 'Utility Payment',     message: 'Mike Johnson has paid the electricity bill share',    date: '2024-01-12', priority: 'low',    status: 'read'   },
];

function NotifRow({ n, onMarkRead }) {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.payment_received;
  const { Icon, iconBg, iconColor, dot } = cfg;
  const unread = n.status === 'unread';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        px: 2.5,
        py: 2,
        borderRadius: '10px',
        bgcolor: unread ? 'rgba(20,184,166,0.04)' : 'transparent',
        borderLeft: unread ? `3px solid ${dot}` : '3px solid transparent',
        transition: 'all 0.18s ease',
        cursor: 'default',
        '&:hover': {
          bgcolor: 'rgba(20,184,166,0.06)',
          transform: 'translateX(2px)',
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 40, height: 40,
          borderRadius: '10px',
          background: iconBg,
          border: `1px solid ${iconColor}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18, color: iconColor }} />
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.35 }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: unread ? 700 : 600, color: '#1A2E2D', letterSpacing: '-0.01em' }}>
            {n.title}
          </Typography>
          {unread && (
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: dot, flexShrink: 0 }} />
          )}
        </Box>
        <Typography sx={{ fontSize: '0.8375rem', color: '#5A6E7F', lineHeight: 1.5 }}>
          {n.message}
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: '#A0B4B8', mt: 0.6, fontWeight: 500, letterSpacing: '0.02em' }}>
          {new Date(n.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Typography>
      </Box>

      {/* Dismiss */}
      {unread && (
        <Button
          size="small"
          onClick={() => onMarkRead(n.id)}
          sx={{
            fontSize: '0.75rem',
            color: '#6B8C95',
            fontWeight: 600,
            flexShrink: 0,
            mt: 0.25,
            px: 1.5,
            py: 0.625,
            border: '1px solid #DDD5C8',
            borderRadius: '7px',
            bgcolor: '#fff',
            transition: 'all 0.15s ease',
            '&:hover': { bgcolor: '#F5F0EA', borderColor: '#B8AFA5', color: '#4A5568', transform: 'translateY(-1px)' },
          }}
        >
          Dismiss
        </Button>
      )}
    </Box>
  );
}

function SectionCard({ children, accent, label, labelColor }) {
  return (
    <Box
      sx={{
        border: '1px solid #E8E0D5',
        borderRadius: '14px',
        overflow: 'hidden',
        bgcolor: '#fff',
        boxShadow: '0 2px 12px rgba(20,184,166,0.07)',
        mb: 2.5,
      }}
    >
      {/* Section header stripe */}
      <Box
        sx={{
          px: 2.5, py: 1.25,
          borderBottom: '1px solid #F0EBE3',
          bgcolor: accent || '#FDFCFA',
          display: 'flex', alignItems: 'center', gap: 1,
        }}
      >
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: labelColor || '#6B8C95' }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ p: 1 }}>
        {children}
      </Box>
    </Box>
  );
}

export default function Notifications({ onMarkAllRead }) {
  const [emailReminders, setEmailReminders] = useState(true);
  const [notifications, setNotifications] = useState(INITIAL);
  const [success, setSuccess] = useState('');

  const handleMarkRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, status: 'read' } : n);
      if (updated.every(n => n.status === 'read')) onMarkAllRead?.();
      return updated;
    });
    setSuccess('Notification dismissed');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    onMarkAllRead?.();
    setSuccess('All notifications dismissed');
  };

  const handleEmailToggle = () => {
    setEmailReminders(v => !v);
    setSuccess(`Email reminders ${!emailReminders ? 'enabled' : 'disabled'}`);
  };

  const urgent = notifications.filter(n => n.priority === 'high');
  const rest   = notifications.filter(n => n.priority !== 'high');
  const hasUnread = notifications.some(n => n.status === 'unread');
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3.5, md: 4 }, }}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#1A2E2D', letterSpacing: '-0.03em' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Box
                sx={{
                  px: 1.25, py: 0.25,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #E76F51, #C45030)',
                  boxShadow: '0 2px 8px rgba(231,111,81,0.35)',
                }}
              >
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '0.03em' }}>
                  {unreadCount} new
                </Typography>
              </Box>
            )}
          </Box>
          {hasUnread && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              sx={{
                p: 0, minWidth: 0, fontSize: '0.8125rem',
                color: '#6B8C95', fontWeight: 600,
                '&:hover': { color: '#14B8A6', bgcolor: 'transparent' },
              }}
            >
              Dismiss all
            </Button>
          )}
        </Box>

        {/* Email toggle */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.25,
            px: 1.75, py: 1,
            border: '1px solid #E8E0D5',
            borderRadius: '10px',
            bgcolor: '#FDFCFA',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <EmailIcon sx={{ fontSize: 15, color: '#6B8C95' }} />
          <Typography sx={{ fontSize: '0.8125rem', color: '#4A5568', fontWeight: 600 }}>
            Email reminders
          </Typography>
          <Switch
            checked={emailReminders}
            onChange={handleEmailToggle}
            size="small"
            sx={{
              ml: 0.25,
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#14B8A6' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#14B8A6' },
            }}
          />
        </Box>
      </Box>

      {/* Urgent section */}
      {urgent.length > 0 && (
        <SectionCard
          label="Needs attention"
          labelColor="#C45030"
          accent="linear-gradient(90deg, #FEF0EB 0%, #FDF8F6 100%)"
        >
          {urgent.map((n, i) => (
            <React.Fragment key={n.id}>
              <NotifRow n={n} onMarkRead={handleMarkRead} />
              {i < urgent.length - 1 && <Divider sx={{ mx: 2, my: 0.5, borderColor: '#F5EDE8' }} />}
            </React.Fragment>
          ))}
        </SectionCard>
      )}

      {/* Recent section */}
      {rest.length > 0 && (
        <SectionCard label="Recent" labelColor="#6B8C95">
          {rest.map((n, i) => (
            <React.Fragment key={n.id}>
              <NotifRow n={n} onMarkRead={handleMarkRead} />
              {i < rest.length - 1 && <Divider sx={{ mx: 2, my: 0.5 }} />}
            </React.Fragment>
          ))}
        </SectionCard>
      )}

      {notifications.every(n => n.status === 'read') && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <BellIcon sx={{ fontSize: 40, color: '#DDD5C8', mb: 1.5 }} />
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#6B8C95' }}>
            All caught up
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#A0B4B8', mt: 0.5 }}>
            No new notifications
          </Typography>
        </Box>
      )}

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
