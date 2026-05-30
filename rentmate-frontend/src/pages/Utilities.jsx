import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, InputAdornment,
  Snackbar, Alert, FormControlLabel, Checkbox, Tooltip, Chip,
  IconButton, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import RepeatIcon from '@mui/icons-material/Repeat';
import FlagIcon from '@mui/icons-material/Flag';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
  const [bills, setBills] = useLocalStorage('rm_utility_bills', []);
  const [roommates] = useLocalStorage('rm_rent_roommates', []);
  const [openAdd, setOpenAdd] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    category: 'Electricity', amount: '', splitMethod: 'Equal',
    customPercents: {}, dueDate: '', description: '', recurring: false, file: null, filePreview: null,
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Split view dialog state
  const [splitDialogBill, setSplitDialogBill] = useState(null);
  // Per-person paid status in split dialog (keyed by bill id + roommate index)
  const [personPaid, setPersonPaid] = useLocalStorage('rm_split_person_paid', {});

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

  const roommateList = Array.isArray(roommates) ? roommates : [];
  const roommateCount = roommateList.length || 1;

  // Initialize custom percents when roommates change or form opens
  const initCustomPercents = useCallback(() => {
    const equal = parseFloat((100 / roommateCount).toFixed(2));
    const percents = {};
    roommateList.forEach((rm, i) => {
      percents[i] = equal;
    });
    if (roommateList.length === 0) percents[0] = 100;
    return percents;
  }, [roommateList, roommateCount]);

  const handleOpenAdd = () => {
    setForm(f => ({
      ...f,
      customPercents: initCustomPercents(),
    }));
    setOpenAdd(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const newBill = {
      id: Date.now(),
      date: form.dueDate || new Date().toISOString().slice(0, 10),
      category: form.category,
      amount: Number(form.amount),
      splitMethod: form.splitMethod,
      customPercents: form.splitMethod === 'Custom' ? form.customPercents : null,
      status: 'pending',
      description: form.description,
      recurring: form.recurring,
      disputed: false,
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
    setForm({ category: 'Electricity', amount: '', splitMethod: 'Equal', customPercents: {}, dueDate: '', description: '', recurring: false, file: null });
    postAuditLog({ entityType: 'UTILITY', action: 'BILL_ADDED', description: `${form.category} ₹${form.amount}`, newValue: `₹${form.amount}` });
  };

  const handleMarkPaid = (id) => {
    const bill = bills.find(b => b.id === id);
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'paid' } : b));
    setSuccess('Bill marked as paid.');
    handleMarkPaidBackend(id);
    if (bill) postAuditLog({ entityType: 'UTILITY', entityId: id, action: 'MARKED_PAID', description: `${bill.category} ₹${bill.amount} marked paid` });
  };

  const handleDispute = (id) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, disputed: true } : b));
    setSuccess('Bill flagged as disputed.');
    postAuditLog({ entityType: 'UTILITY', entityId: id, action: 'DISPUTED' });
  };

  const handlePersonPaid = (billId, idx) => {
    const key = `${billId}_${idx}`;
    setPersonPaid(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute split breakdown for a bill
  const getSplitRows = (bill) => {
    const count = roommateCount;
    const names = roommateList.length > 0
      ? roommateList.map(r => r.name || r)
      : Array.from({ length: count }, (_, i) => `Roommate ${i + 1}`);

    if (bill.splitMethod === 'Equal') {
      const share = bill.amount / count;
      return names.map((name, i) => ({
        name,
        percent: parseFloat((100 / count).toFixed(2)),
        amount: share,
        paid: !!personPaid[`${bill.id}_${i}`],
        idx: i,
      }));
    }
    if (bill.splitMethod === 'Custom' && bill.customPercents) {
      return names.map((name, i) => {
        const pct = parseFloat(bill.customPercents[i] || 0);
        return {
          name,
          percent: pct,
          amount: (bill.amount * pct) / 100,
          paid: !!personPaid[`${bill.id}_${i}`],
          idx: i,
        };
      });
    }
    // Weighted — equal fallback
    const share = bill.amount / count;
    return names.map((name, i) => ({
      name,
      percent: parseFloat((100 / count).toFixed(2)),
      amount: share,
      paid: !!personPaid[`${bill.id}_${i}`],
      idx: i,
    }));
  };

  const customPercentTotal = Object.values(form.customPercents).reduce((s, v) => s + parseFloat(v || 0), 0);

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
          onClick={handleOpenAdd}
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
                      {bill.disputed && (
                        <Chip label="Disputed" size="small" sx={{ bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#101827' }}>
                      {fmtINR(bill.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#4A5568' }}>{bill.splitMethod}</Typography>
                      {(bill.splitMethod === 'Equal' || bill.splitMethod === 'Custom') && (
                        <Tooltip title="View split breakdown" arrow>
                          <IconButton size="small" onClick={() => setSplitDialogBill(bill)} sx={{ p: 0.25 }}>
                            <VisibilityIcon sx={{ fontSize: 14, color: '#14B8A6' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={bill.status} />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#6B8C95' }}>{bill.description || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                      {!bill.disputed && (
                        <Tooltip title="Flag as disputed" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDispute(bill.id)}
                            sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444' } }}
                          >
                            <FlagIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
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
                <Select
                  value={form.splitMethod}
                  onChange={e => {
                    const sm = e.target.value;
                    setForm(f => ({
                      ...f,
                      splitMethod: sm,
                      customPercents: sm === 'Custom' ? initCustomPercents() : f.customPercents,
                    }));
                  }}
                  label="Split method"
                >
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

            {/* Custom percentage inputs per roommate */}
            {form.splitMethod === 'Custom' && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#101827', mb: 1 }}>
                  Custom split percentages
                </Typography>
                {(roommateList.length > 0 ? roommateList : [{ name: 'You' }]).map((rm, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography sx={{ fontSize: '0.875rem', color: '#4A5568', minWidth: 100 }}>
                      {rm.name || rm || `Roommate ${i + 1}`}
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={form.customPercents[i] ?? ''}
                      onChange={e => setForm(f => ({
                        ...f,
                        customPercents: { ...f.customPercents, [i]: e.target.value },
                      }))}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                      inputProps={{ min: 0, max: 100, step: 0.5 }}
                      sx={{ width: 120 }}
                    />
                  </Box>
                ))}
                <Typography sx={{
                  fontSize: '0.8125rem',
                  color: Math.abs(customPercentTotal - 100) < 0.1 ? '#14B8A6' : '#EF4444',
                  fontWeight: 600, mt: 0.5,
                }}>
                  Total: {customPercentTotal.toFixed(1)}% {Math.abs(customPercentTotal - 100) < 0.1 ? '✓' : '(must equal 100%)'}
                </Typography>
              </Box>
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
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setForm(f => ({ ...f, file }));
                    if (file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onload = ev => setForm(f => ({ ...f, filePreview: ev.target.result }));
                      reader.readAsDataURL(file);
                    } else {
                      setForm(f => ({ ...f, filePreview: null }));
                    }
                  }}
                />
              </Button>
              {form.file && (
                <Typography sx={{ fontSize: '0.75rem', color: '#6B8C95' }}>{form.file.name}</Typography>
              )}
              {form.filePreview && (
                <Box sx={{ mt: 1.5, width: '100%' }}>
                  <img
                    src={form.filePreview}
                    alt="Receipt preview"
                    style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, border: '1px solid #E8E0D5', objectFit: 'contain' }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add bill</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Split Breakdown Dialog */}
      <Dialog open={!!splitDialogBill} onClose={() => setSplitDialogBill(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Split Breakdown — {splitDialogBill?.category} {splitDialogBill && fmtINR(splitDialogBill.amount)}
        </DialogTitle>
        <DialogContent>
          {splitDialogBill && (() => {
            const rows = getSplitRows(splitDialogBill);
            return (
              <>
                <Typography sx={{ fontSize: '0.8125rem', color: '#6B8C95', mb: 2 }}>
                  Method: <strong>{splitDialogBill.splitMethod}</strong> &nbsp;|&nbsp; {rows.length} roommate{rows.length !== 1 ? 's' : ''}
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Roommate</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Share %</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{row.name}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: '#6B7280' }}>{row.percent.toFixed(1)}%</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{fmtINR(row.amount)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={row.paid ? 'Paid' : 'Unpaid'}
                                size="small"
                                sx={{
                                  bgcolor: row.paid ? '#D1FAE5' : '#FEF3C7',
                                  color: row.paid ? '#065F46' : '#92400E',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  height: 22,
                                }}
                              />
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => handlePersonPaid(splitDialogBill.id, row.idx)}
                                sx={{ fontSize: '0.75rem', minWidth: 0, px: 0.5, color: '#14B8A6' }}
                              >
                                {row.paid ? 'Undo' : 'Mark paid'}
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    Paid: {rows.filter(r => r.paid).length} / {rows.length}
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#101827' }}>
                    Collected: {fmtINR(rows.filter(r => r.paid).reduce((s, r) => s + r.amount, 0))}
                  </Typography>
                </Box>
              </>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSplitDialogBill(null)} variant="contained">Close</Button>
        </DialogActions>
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
