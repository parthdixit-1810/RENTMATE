import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Chip, Divider, Snackbar, Alert, Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';

const INITIAL_INVITES = [
  { id: 1, email: 'alex.chen@email.com', name: 'Alex Chen', sentAt: '2024-01-20', status: 'accepted' },
  { id: 2, email: 'priya.k@email.com', name: 'Priya K', sentAt: '2024-01-22', status: 'pending' },
];

const getInitials = (name) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const avatarColors = ['#1a237e', '#3949ab', '#ff6f61', '#00897b', '#6d4c41'];

export default function InviteRoommate() {
  const [email, setEmail] = useState('');
  const [invites, setInvites] = useState(INITIAL_INVITES);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const inviteLink = 'https://rentmate.app/invite/rm-x7k9q2';

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (invites.find(i => i.email.toLowerCase() === trimmed)) {
      setError('An invite has already been sent to this address.');
      return;
    }
    const name = trimmed.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    setInvites(prev => [
      { id: Date.now(), email: trimmed, name, sentAt: new Date().toISOString().slice(0, 10), status: 'pending' },
      ...prev,
    ]);
    setSuccess(`Invite sent to ${trimmed}`);
    setEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResend = (id) => {
    setSuccess('Invite resent successfully.');
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ flexShrink: 0 }}>
            <rect width="56" height="56" rx="14" fill="#e8eaf6" />
            <circle cx="22" cy="22" r="7" stroke="#1a237e" strokeWidth="2.2" />
            <path d="M10 42c0-6.6 5.4-12 12-12" stroke="#1a237e" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M42 32v10M37 37h10" stroke="#ff6f61" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <Box>
            <Typography variant="h6" fontWeight={700}>Invite a Roommate</Typography>
            <Typography variant="body2" color="text.secondary">
              Send an email invite or share a link to join your household.
            </Typography>
          </Box>
        </Box>

        {/* Email form */}
        <form onSubmit={handleSend}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              placeholder="roommate@email.com"
              required
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<SendIcon />}
              sx={{ whiteSpace: 'nowrap', textTransform: 'none', fontWeight: 700 }}
            >
              Send Invite
            </Button>
          </Box>
        </form>

        {/* Copy link row */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
          bgcolor: '#f5f7fa', borderRadius: 2, mb: 3, border: '1px solid #e0e7ef'
        }}>
          <LinkIcon sx={{ color: 'text.secondary', fontSize: 18, flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary" sx={{
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.8rem'
          }}>
            {inviteLink}
          </Typography>
          <Tooltip title={copied ? 'Copied!' : 'Copy invite link'}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
              sx={{ whiteSpace: 'nowrap', textTransform: 'none', minWidth: 100 }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </Tooltip>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Sent Invites
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {invites.filter(i => i.status === 'pending').length} pending
          </Typography>
        </Box>

        {invites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 8px', display: 'block' }}>
              <circle cx="24" cy="24" r="24" fill="#f5f7fa" />
              <circle cx="24" cy="20" r="7" stroke="#c5cae9" strokeWidth="2" />
              <path d="M10 40c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#c5cae9" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <Typography variant="body2" color="text.secondary">No invites sent yet.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {invites.map((invite, idx) => (
              <React.Fragment key={invite.id}>
                <ListItem
                  sx={{ px: 0, py: 1 }}
                  secondaryAction={
                    invite.status === 'pending' && (
                      <Button size="small" onClick={() => handleResend(invite.id)} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                        Resend
                      </Button>
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{
                      bgcolor: avatarColors[invite.id % avatarColors.length],
                      width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700
                    }}>
                      {getInitials(invite.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={invite.email}
                    secondary={`Invited ${invite.sentAt}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Chip
                    label={invite.status === 'accepted' ? 'Joined' : 'Pending'}
                    color={invite.status === 'accepted' ? 'success' : 'default'}
                    size="small"
                    variant={invite.status === 'accepted' ? 'filled' : 'outlined'}
                    sx={{ mr: invite.status === 'pending' ? 7 : 0, fontWeight: 600 }}
                  />
                </ListItem>
                {idx < invites.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
    </Card>
  );
}
