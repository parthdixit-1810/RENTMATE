import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Switch, FormControlLabel,
  Button, Divider, Select, MenuItem, FormControl, InputLabel,
  TextField, Snackbar, Alert, Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export default function Settings() {
  const [settings, setSettings] = useState({
    emailReminders: true,
    reminderDaysBefore: 3,
    currency: 'INR',
    defaultSplitMethod: 'equal',
    showUtilitiesOnDashboard: true,
    receiptEmailOnPayment: false,
    darkMode: false,
    language: 'en',
  });
  const [success, setSuccess] = useState('');

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSuccess('Settings saved successfully.');
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} color="primary.main" sx={{ mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure your preferences for RentMate.
        </Typography>
      </Box>

      {/* Notifications */}
      <Card sx={{ borderRadius: 3, border: '1px solid #eaeff5', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.1-1.6-5.6-4.5-6.3V4c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v.7C7.6 5.4 6 7.9 6 11v5l-2 2v1h16v-1l-2-2z" fill="#1a237e" opacity="0.7" />
            </svg>
            <Typography variant="h6" fontWeight={700}>Notifications</Typography>
          </Box>

          <FormControlLabel
            control={<Switch checked={settings.emailReminders} onChange={e => update('emailReminders', e.target.checked)} color="primary" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>Email Reminders</Typography>
                <Typography variant="caption" color="text.secondary">Receive email alerts for upcoming due dates</Typography>
              </Box>
            }
            labelPlacement="start"
            sx={{ display: 'flex', justifyContent: 'space-between', ml: 0, mb: 2, width: '100%' }}
          />

          {settings.emailReminders && (
            <Box sx={{ pl: 0 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Remind me</InputLabel>
                <Select value={settings.reminderDaysBefore} onChange={e => update('reminderDaysBefore', e.target.value)} label="Remind me">
                  <MenuItem value={1}>1 day before</MenuItem>
                  <MenuItem value={3}>3 days before</MenuItem>
                  <MenuItem value={5}>5 days before</MenuItem>
                  <MenuItem value={7}>1 week before</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={<Switch checked={settings.receiptEmailOnPayment} onChange={e => update('receiptEmailOnPayment', e.target.checked)} color="primary" />}
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>Receipt on Payment</Typography>
                <Typography variant="caption" color="text.secondary">Send a PDF receipt email when a payment is recorded</Typography>
              </Box>
            }
            labelPlacement="start"
            sx={{ display: 'flex', justifyContent: 'space-between', ml: 0, width: '100%' }}
          />
        </CardContent>
      </Card>

      {/* Expense Preferences */}
      <Card sx={{ borderRadius: 3, border: '1px solid #eaeff5', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="#1a237e" opacity="0.7" />
            </svg>
            <Typography variant="h6" fontWeight={700}>Expense Preferences</Typography>
          </Box>

          <Box sx={{ display: 'grid', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Default Split Method</InputLabel>
              <Select value={settings.defaultSplitMethod} onChange={e => update('defaultSplitMethod', e.target.value)} label="Default Split Method">
                <MenuItem value="equal">Equal Split</MenuItem>
                <MenuItem value="weighted">Weighted by Room Size</MenuItem>
                <MenuItem value="custom">Custom Percentages</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select value={settings.currency} onChange={e => update('currency', e.target.value)} label="Currency">
                <MenuItem value="INR">INR — Indian Rupee (₹)</MenuItem>
                <MenuItem value="USD">USD — US Dollar ($)</MenuItem>
                <MenuItem value="EUR">EUR — Euro (€)</MenuItem>
                <MenuItem value="GBP">GBP — British Pound (£)</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch checked={settings.showUtilitiesOnDashboard} onChange={e => update('showUtilitiesOnDashboard', e.target.checked)} color="primary" />}
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>Show Utilities on Dashboard</Typography>
                  <Typography variant="caption" color="text.secondary">Display individual utility categories in the expense chart</Typography>
                </Box>
              }
              labelPlacement="start"
              sx={{ display: 'flex', justifyContent: 'space-between', ml: 0, width: '100%' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card sx={{ borderRadius: 3, border: '1px solid #eaeff5', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#1a237e" opacity="0.7" />
            </svg>
            <Typography variant="h6" fontWeight={700}>Appearance</Typography>
          </Box>

          <FormControlLabel
            control={<Switch checked={settings.darkMode} onChange={e => update('darkMode', e.target.checked)} color="primary" />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>Dark Mode</Typography>
                  <Typography variant="caption" color="text.secondary">Switch to a dark colour scheme</Typography>
                </Box>
                <Chip label="Coming soon" size="small" sx={{ ml: 1, fontSize: '0.65rem' }} />
              </Box>
            }
            labelPlacement="start"
            sx={{ display: 'flex', justifyContent: 'space-between', ml: 0, width: '100%' }}
          />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card sx={{ borderRadius: 3, border: '1px solid #ffcdd2', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} color="error.main" sx={{ mb: 2 }}>
            Danger Zone
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>Clear All Data</Typography>
              <Typography variant="caption" color="text.secondary">Permanently delete all payments and bills from this household.</Typography>
            </Box>
            <Button variant="outlined" color="error" size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>
              Clear Data
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>Leave Household</Typography>
              <Typography variant="caption" color="text.secondary">Remove yourself from this shared household group.</Typography>
            </Box>
            <Button variant="outlined" color="error" size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>
              Leave
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ textTransform: 'none', fontWeight: 700, px: 4, borderRadius: 2 }}
        >
          Save Settings
        </Button>
      </Box>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
