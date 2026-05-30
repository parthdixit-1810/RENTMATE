import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, InputAdornment,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  Chip, IconButton, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLocalStorage } from '../hooks/useLocalStorage';

const REMINDER_CATEGORIES = ['Rent', 'Electricity', 'Water', 'Internet', 'Gas', 'Other'];

const fmtINR = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

function getDueDotColor(dueDateStr) {
  if (!dueDateStr) return '#6B7280';
  const due = new Date(dueDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = (due - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return '#EF4444';   // overdue — red
  if (diff <= 7) return '#FBBF24';  // within 7 days — yellow
  return '#14B8A6';                 // fine — teal/green
}

function DueDot({ date }) {
  const color = getDueDotColor(date);
  return <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0, mt: '2px' }} />;
}

export default function Reminders() {
  const [bills] = useLocalStorage('rm_utility_bills', []);
  const [roommates] = useLocalStorage('rm_rent_roommates', []);
  const [reminders, setReminders] = useLocalStorage('rm_reminders', []);
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', dueDate: '', category: 'Rent' });
  const [snack, setSnack] = useState('');

  // Bills & rent items that are not paid, sorted by due date
  const upcomingItems = useMemo(() => {
    const billItems = (bills || [])
      .filter(b => b.status !== 'paid')
      .map(b => ({
        id: `bill_${b.id}`,
        type: 'bill',
        description: `${b.category} — ${b.description || 'Utility bill'}`,
        dueDate: b.date,
        amount: b.amount,
        category: b.category,
        status: b.status,
        billId: b.id,
      }));

    const rentItems = (roommates || [])
      .filter(r => r.status !== 'paid' && r.status !== 'Paid')
      .map((r, i) => ({
        id: `rent_${i}`,
        type: 'rent',
        description: `Rent — ${r.name || r}`,
        dueDate: r.dueDate || null,
        amount: r.rentAmount || r.amount || 0,
        category: 'Rent',
        status: r.status || 'pending',
      }));

    return [...billItems, ...rentItems].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [bills, roommates]);

  const [markedPaidLocal, setMarkedPaidLocal] = useLocalStorage('rm_reminders_marked_paid', {});

  const handleMarkPaidLocal = (id) => {
    setMarkedPaidLocal(prev => ({ ...prev, [id]: true }));
    setSnack('Marked as paid!');
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!form.title) return;
    const newReminder = {
      id: Date.now(),
      title: form.title,
      amount: parseFloat(form.amount) || 0,
      dueDate: form.dueDate,
      category: form.category,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setReminders(prev => [newReminder, ...(prev || [])]);
    setForm({ title: '', amount: '', dueDate: '', category: 'Rent' });
    setOpenAdd(false);
    setSnack('Reminder added.');
  };

  const handleMarkReminderDone = (id) => {
    setReminders(prev => (prev || []).map(r => r.id === id ? { ...r, done: true } : r));
    setSnack('Reminder marked as done.');
  };

  const handleDeleteReminder = (id) => {
    setReminders(prev => (prev || []).filter(r => r.id !== id));
  };

  const activeReminders = (reminders || []).filter(r => !r.done);
  const doneReminders = (reminders || []).filter(r => r.done);

  const visibleUpcoming = upcomingItems.filter(item => !markedPaidLocal[item.id]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Hero Header */}
      <Box
        sx={{
          mb: 3.5, p: 3, borderRadius: '16px',
          background: 'linear-gradient(135deg, #101827 0%, #101827 60%, #FBBF2422 100%)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(251,191,36,0.18)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationsActiveIcon sx={{ color: '#FBBF24', fontSize: 28 }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#FDFCFA', letterSpacing: '-0.03em' }}>
              Reminders
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#6B8C95', mt: 0.5 }}>
              Stay on top of upcoming payments and dues
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 15 }} />}
          onClick={() => setOpenAdd(true)}
          sx={{ position: 'relative' }}
        >
          Add reminder
        </Button>
      </Box>

      {/* Upcoming Payments Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#101827', mb: 0.5 }}>
            Upcoming Payments
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280', mb: 2.5 }}>
            Bills and rent pulled from your records
          </Typography>

          {visibleUpcoming.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#14B8A6', mb: 1 }} />
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151' }}>
                No pending payments
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#9CA3AF', mt: 0.5 }}>
                All bills and rent are up to date!
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', width: 20 }} />
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Status</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleUpcoming.map(item => {
                    const dotColor = getDueDotColor(item.dueDate);
                    const isOverdue = dotColor === '#EF4444';
                    const isSoon = dotColor === '#FBBF24';
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <DueDot date={item.dueDate} />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#1F2937' }}>
                            {item.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.8125rem', color: isOverdue ? '#EF4444' : '#4A5568', fontWeight: isOverdue ? 600 : 400 }}>
                            {fmtDate(item.dueDate)}
                            {isOverdue && ' (Overdue)'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#101827' }}>
                            {fmtINR(item.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isOverdue ? 'Overdue' : isSoon ? 'Due soon' : 'Upcoming'}
                            size="small"
                            sx={{
                              bgcolor: isOverdue ? '#FEE2E2' : isSoon ? '#FEF3C7' : '#D1FAE5',
                              color: isOverdue ? '#991B1B' : isSoon ? '#92400E' : '#065F46',
                              fontWeight: 600, fontSize: '0.75rem', height: 22,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleMarkPaidLocal(item.id)}
                            sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
                          >
                            Mark paid
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Custom Reminders Card */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#101827', mb: 2.5 }}>
            Custom Reminders
          </Typography>

          {activeReminders.length === 0 && doneReminders.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                No custom reminders yet. Click "Add reminder" to create one.
              </Typography>
            </Box>
          ) : (
            <Box>
              {activeReminders.map(r => {
                const dotColor = getDueDotColor(r.dueDate);
                const isOverdue = dotColor === '#EF4444';
                return (
                  <Box
                    key={r.id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 2,
                      py: 1.5, borderBottom: '1px solid #F3F4F6',
                    }}
                  >
                    <DueDot date={r.dueDate} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F2937' }}>
                          {r.title}
                        </Typography>
                        <Chip
                          label={r.category}
                          size="small"
                          sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontSize: '0.7rem', height: 18 }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: isOverdue ? '#EF4444' : '#6B7280' }}>
                        {fmtDate(r.dueDate)} {r.amount > 0 && `· ${fmtINR(r.amount)}`}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleMarkReminderDone(r.id)}
                      sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                      Done
                    </Button>
                    <IconButton size="small" onClick={() => handleDeleteReminder(r.id)} sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444' } }}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                );
              })}

              {doneReminders.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#9CA3AF', mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Completed
                  </Typography>
                  {doneReminders.map(r => (
                    <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1, opacity: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 14, color: '#14B8A6' }} />
                      <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280', textDecoration: 'line-through', flex: 1 }}>
                        {r.title}
                      </Typography>
                      <IconButton size="small" onClick={() => handleDeleteReminder(r.id)} sx={{ color: '#D1D5DB', '&:hover': { color: '#EF4444' } }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Reminder Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Reminder</DialogTitle>
        <form onSubmit={handleAddReminder}>
          <DialogContent>
            <TextField
              label="Title"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Pay electricity bill"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Amount"
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
              <TextField
                label="Due date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                label="Category"
              >
                {REMINDER_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="success" onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
}
