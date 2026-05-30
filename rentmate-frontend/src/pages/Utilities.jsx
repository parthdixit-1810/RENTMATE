import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, InputAdornment,
  Snackbar, Alert, FormControlLabel, Checkbox, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import RepeatIcon from '@mui/icons-material/Repeat';
import PaymentModal from '../components/PaymentModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import api from '../api';

const postAuditLog = (entry) => api.post('/api/audit-logs', entry).catch(() => {});

const CATEGORIES = ['Electricity', 'Water', 'Internet', 'Gas', 'Other'];
const SPLIT_METHODS = [
  { value: 'Equal', label: 'Equal split' },
  { value: 'Custom', label: 'Custom percentage' },
  { value: 'Weighted', label: 'Weighted by room' },
];

const CATEGORY_DOTS = {
  Electricity: '#f59e0b',
  Water: '#0ea5e9',
  Internet: '#8b5cf6',
  Gas: '#f97316',
  Other: '#4A5568',
};

const DEFAULT_BILLS = [
  { id: 1, date: '2024-01-15', category: 'Electricity', amount: 2500, splitMethod: 'Equal', status: 'paid', description: 'January bill', recurring: true },
  { id: 2, date: '2024-01-20', category: 'Water', amount: 800, splitMethod: 'Equal', status: 'pending', description: 'January bill', recurring: false },
  { id: 3, date: '2024-01-10', category: 'Internet', amount: 1200, splitMethod: 'Equal', status: 'overdue', description: 'January bill', recurring: true },
  { id: 4, date: '2024-01-25', category: 'Gas', amount: 600, splitMethod: 'Equal', status: 'pending', description: 'January bill', recurring: false },
];

const fmtINR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

function StatusBadge({ status }) {
  const config = {
    paid:    { dot: '#14B8A6', text: '#14B8A6', label: 'Paid' },
    pending: { dot: '#D97706', text: '#B45309', label: 'Pending' },
    overdue: { dot: '#E76F51', text: '#C45030', label: 'Overdue' },
  }[status] || { dot: '#6B8C95', text: '#7A9BA3', label: status };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.625 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: config.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: config.text }}>{config.label}</Typography>
    </Box>
  );
}

export default function Utilities() {
  const [bills, setBills] = useLocalStorage('rm_utility_bills', DEFAULT_BILLS);
  const [openAdd, setOpenAdd] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    category: 'Electricity', amount: '', splitMethod: 'Equal',
    customPercent: '', dueDate: '', description: '', recurring: false, file: null,
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    api.get('/api/utilities')
      .then(res => {
        if (res.data?.length > 0) {
          setBills(res.data.map(u => ({
            id: u.id,
            date: u.dueDate || new Date().toISOString().slice(0, 10),
            category: u.name || 'Electricity',
            amount: u.amount || 0,
            splitMethod: 'Equal',
            status: u.status === 'PAID' ? 'paid' : 'pending',
            description: '',
            recurring: false,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const handleMarkPaidBackend = useCallback(async (id) => {
    try { await api.patch(`/api/utilities/${id}/mark-paid`); } catch {}
  }, []);

  const totalBills   = bills.reduce((s, b) => s + b.amount, 0);
  const paidBills    = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const pendingBills = bills.filter(b => b.status === 'pending').reduce((s, b) => s + b.amount, 0);
  const overdueBills = bills.filter(b => b.status === 'overdue').reduce((s, b) => s + b.amount, 0);

  const handleAdd = async (e) => {
    e.preventDefault();
    const newBill = {
      id: Date.now(),
      date: form.dueDate || new Date().toISOString().slice(0, 10),
      category: form.category,
      amount: Number(form.amount),
      splitMethod: form.splitMethod,
      status: 'pending',
      description: form.description,
      recurring: form.recurring,
    };
    setBills(prev => [newBill, ...prev]);
    if (form.recurring) {
      const next = new Date(newBill.date);
      next.setMonth(next.getMonth() + 1);
      setBills(prev => [{ ...newBill, id: Date.now() + 1, date: next.toISOString().slice(0, 10) }, ...prev]);
    }
    try {
      const roomsRes = await api.get('/api/rooms');
      if (roomsRes.data?.length > 0) {
        const payload = { name: form.category, amount: Number(form.amount), status: 'UNPAID', dueDate: form.dueDate || new Date().toISOString().slice(0, 10) };
        await api.post(`/api/utilities/room/${roomsRes.data[0].id}`, payload);
      }
    } catch {}
    setOpenAdd(false);
    setSuccess(`${form.category} bill added.`);
    setForm({ category: 'Electricity', amount: '', splitMethod: 'Equal', customPercent: '', dueDate: '', description: '', recurring: false, file: null });
    postAuditLog({ entityType: 'UTILITY', action: 'BILL_ADDED', description: `${form.category} ₹${form.amount}`, newValue: `₹${form.amount}` });
  };

  const handleMarkPaid = (id) => {
    const bill = bills.find(b => b.id === id);
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'paid' } : b));
    setSuccess('Bill marked as paid.');
    handleMarkPaidBackend(id);
    if (bill) postAuditLog({ entityType: 'UTILITY', entityId: id, action: 'MARKED_PAID', description: `${bill.category} ₹${bill.amount} marked paid` });
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, }}>
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
        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#FDFCFA', letterSpacing: '-0.03em' }}>
            Utility Bills
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#6B8C95', mt: 0.5 }}>
            Track and split household utility expenses
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 15 }} />}
          onClick={() => setOpenAdd(true)}
          sx={{ position: 'relative' }}
        >
          Add bill
        </Button>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        {[
          { label: 'Total',    value: fmtINR(totalBills),   accent: '#1E4D5E' },
          { label: 'Paid',     value: fmtINR(paidBills),    accent: '#14B8A6' },
          { label: 'Pending',  value: fmtINR(pendingBills), accent: '#D97706' },
          { label: 'Overdue',  value: fmtINR(overdueBills), accent: '#E76F51' },
        ].map(s => (
          <Card key={s.label} sx={{ borderTop: `3px solid ${s.accent}`, background: `linear-gradient(145deg,#fff 60%,${s.accent}0D 100%)` }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A0B4B8', display: 'block', mb: 1.5 }}>{s.label}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#1A2E2D', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Table */}
      <Card>
        <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Split</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.map(bill => (
                <TableRow key={bill.id}>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#4A5568' }}>
                      {new Date(bill.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: CATEGORY_DOTS[bill.category] || '#4A5568', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#101827' }}>{bill.category}</Typography>
                      {bill.recurring && (
                        <Tooltip title="Recurring monthly" arrow>
                          <RepeatIcon sx={{ fontSize: 13, color: '#6B8C95' }} />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#101827' }}>
                      {fmtINR(bill.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#4A5568' }}>{bill.splitMethod}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={bill.status} />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#6B8C95' }}>{bill.description || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    {bill.status !== 'paid' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => { setSelectedBill(bill); setPaymentModalOpen(true); }}
                        sx={{ fontSize: '0.8125rem' }}
                      >
                        Mark paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Utility Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Utility Bill</DialogTitle>
        <form onSubmit={handleAdd}>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} label="Category">
                  {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Amount"
                type="number"
                required
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Split method</InputLabel>
                <Select value={form.splitMethod} onChange={e => setForm(f => ({ ...f, splitMethod: e.target.value }))} label="Split method">
                  {SPLIT_METHODS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Due date"
                type="date"
                required
                InputLabelProps={{ shrink: true }}
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </Box>
            {form.splitMethod === 'Custom' && (
              <TextField
                label="Your percentage"
                type="number"
                fullWidth
                sx={{ mb: 2 }}
                value={form.customPercent}
                onChange={e => setForm(f => ({ ...f, customPercent: e.target.value }))}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                inputProps={{ min: 0, max: 100, step: 0.5 }}
              />
            )}
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. January 2024 bill"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.recurring}
                    onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))}
                    size="small"
                    sx={{ '&.Mui-checked': { color: '#14B8A6' } }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <RepeatIcon sx={{ fontSize: 14, color: '#6B8C95' }} />
                    <Typography sx={{ fontSize: '0.875rem', color: '#2D3748' }}>Recurring monthly</Typography>
                  </Box>
                }
              />
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<UploadIcon sx={{ fontSize: 14 }} />}
              >
                Attach receipt
                <input type="file" hidden accept="image/*,.pdf" onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))} />
              </Button>
              {form.file && (
                <Typography sx={{ fontSize: '0.75rem', color: '#6B8C95' }}>{form.file.name}</Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add bill</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={!!success} autoHideDuration={3500} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        utility={selectedBill}
        onSuccess={() => { handleMarkPaid(selectedBill?.id); setPaymentModalOpen(false); }}
      />
    </Box>
  );
}
