import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel, Snackbar, Alert, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PaymentModal from '../components/PaymentModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import api from '../api';

const postAuditLog = (entry) => api.post('/api/audit-logs', entry).catch(() => {});

const DEFAULT_ROOMMATES = [
  { id: 1, name: 'John Doe', share: 40, amount: 4800, status: 'paid', room: 'Master Bedroom' },
  { id: 2, name: 'Jane Smith', share: 30, amount: 3600, status: 'unpaid', room: 'Bedroom 2' },
  { id: 3, name: 'Mike Johnson', share: 30, amount: 3600, status: 'unpaid', room: 'Bedroom 3' },
];

const fmtINR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

function StatusBadge({ status }) {
  const paid = status === 'paid';
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.625 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: paid ? '#14B8A6' : '#A0B4B8', flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: paid ? '#14B8A6' : '#7A9BA3' }}>
        {paid ? 'Paid' : 'Pending'}
      </Typography>
    </Box>
  );
}

export default function Rent() {
  const [roommates, setRoommates] = useLocalStorage('rm_rent_roommates', DEFAULT_ROOMMATES);
  const [weightedSplit, setWeightedSplit] = useLocalStorage('rm_rent_weighted', true);

  const [openAddRent, setOpenAddRent] = useState(false);
  const [openEditWeights, setOpenEditWeights] = useState(false);
  const [success, setSuccess] = useState('');
  const [rentForm, setRentForm] = useState({ amount: '', due: '' });
  const [weightsForm, setWeightsForm] = useState({});
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRoommate, setSelectedRoommate] = useState(null);

  const totalRent = roommates.reduce((sum, rm) => sum + rm.amount, 0);
  const paidTotal = roommates.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);
  const unpaidTotal = totalRent - paidTotal;

  const handleAddRent = (e) => {
    e.preventDefault();
    const total = Number(rentForm.amount);
    if (total <= 0) return;
    setRoommates(prev => prev.map(rm => ({
      ...rm,
      amount: Math.round((rm.share / 100) * total),
      status: 'unpaid',
    })));
    setOpenAddRent(false);
    setSuccess(`Rent set to ${fmtINR(total)}. Shares recalculated.`);
    setRentForm({ amount: '', due: '' });
    postAuditLog({ entityType: 'RENT', action: 'RENT_SET', description: `Total rent set to ${fmtINR(total)}`, newValue: `₹${total}` });
  };

  const handleEditWeights = (e) => {
    e.preventDefault();
    const entries = roommates.map(rm => weightsForm[rm.id] ?? rm.share);
    const total = entries.reduce((s, v) => s + Number(v), 0);
    if (Math.abs(total - 100) > 0.01) {
      alert(`Shares must total 100%. Currently: ${total.toFixed(1)}%`);
      return;
    }
    const oldSummary = roommates.map(r => `${r.name}:${r.share}%`).join(', ');
    const newSummary = roommates.map(r => `${r.name}:${weightsForm[r.id] ?? r.share}%`).join(', ');
    setRoommates(prev => prev.map(rm => {
      const newShare = weightsForm[rm.id] !== undefined ? Number(weightsForm[rm.id]) : rm.share;
      return { ...rm, share: newShare, amount: Math.round((newShare / 100) * totalRent) };
    }));
    setOpenEditWeights(false);
    setSuccess('Rent split updated.');
    setWeightsForm({});
    postAuditLog({ entityType: 'RENT', action: 'SPLIT_CHANGED', description: 'Rent split weights updated', oldValue: oldSummary, newValue: newSummary });
  };

  const handleMarkAsPaid = (id) => {
    setRoommates(prev => prev.map(rm => rm.id === id ? { ...rm, status: 'paid' } : rm));
    setSuccess('Payment recorded.');
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, }}>
      {/* Hero Header */}
      <Box
        sx={{
          mb: 3.5, p: 3, borderRadius: '16px',
          background: 'linear-gradient(135deg, #101827 0%, #101827 60%, #14B8A622 100%)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(20,184,166,0.18)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#FDFCFA', letterSpacing: '-0.03em' }}>
            Rent
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#6B8C95', mt: 0.5 }}>
            Monthly tracking and split management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, position: 'relative' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon sx={{ fontSize: 15 }} />}
            onClick={() => { setWeightsForm({}); setOpenEditWeights(true); }}
            sx={{ borderColor: 'rgba(255,255,255,0.25)', color: '#CBD5D8', '&:hover': { borderColor: 'rgba(255,255,255,0.45)', bgcolor: 'rgba(255,255,255,0.07)' } }}
          >
            Edit split
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
            onClick={() => setOpenAddRent(true)}
          >
            Set rent
          </Button>
        </Box>
      </Box>

      {/* Summary cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        {[
          { label: 'Total rent', value: fmtINR(totalRent), accent: '#14B8A6' },
          { label: 'Collected', value: fmtINR(paidTotal), accent: '#14B8A6' },
          { label: 'Outstanding', value: fmtINR(unpaidTotal), accent: unpaidTotal > 0 ? '#E76F51' : '#14B8A6' },
        ].map(s => (
          <Card key={s.label} sx={{ borderTop: `3px solid ${s.accent}`, background: `linear-gradient(145deg,#fff 60%,${s.accent}0D 100%)` }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A0B4B8', display: 'block', mb: 1.5 }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#1A2E2D', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Split toggle */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#101827' }}>
                {weightedSplit ? 'Weighted split' : 'Equal split'}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#6B8C95', mt: 0.25 }}>
                {weightedSplit ? 'Divided by room size and custom percentages' : 'Divided equally among all roommates'}
              </Typography>
            </Box>
            <Switch
              checked={weightedSplit}
              onChange={e => setWeightedSplit(e.target.checked)}
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#14B8A6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#14B8A6' } }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Roommate</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Share</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {roommates.map(rm => (
                <TableRow key={rm.id}>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#101827' }}>
                      {rm.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem', color: '#4A5568' }}>{rm.room}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#2D3748', fontWeight: 500 }}>
                      {rm.share}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#101827' }}>
                      {fmtINR(rm.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={rm.status} />
                  </TableCell>
                  <TableCell>
                    {rm.status !== 'paid' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => { setSelectedRoommate(rm); setPaymentModalOpen(true); }}
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

      {/* Set Rent Dialog */}
      <Dialog open={openAddRent} onClose={() => setOpenAddRent(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Set Monthly Rent</DialogTitle>
        <form onSubmit={handleAddRent}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Total rent amount"
                type="number"
                fullWidth
                required
                value={rentForm.amount}
                onChange={e => setRentForm({ ...rentForm, amount: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
              <TextField
                label="Due date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={rentForm.due}
                onChange={e => setRentForm({ ...rentForm, due: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddRent(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Weights Dialog */}
      <Dialog open={openEditWeights} onClose={() => setOpenEditWeights(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Rent Split</DialogTitle>
        <form onSubmit={handleEditWeights}>
          <DialogContent>
            <Typography sx={{ fontSize: '0.8125rem', color: '#4A5568', mb: 2 }}>
              Percentages must total 100%.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {roommates.map(rm => (
                <TextField
                  key={rm.id}
                  label={`${rm.name} — ${rm.room}`}
                  type="number"
                  fullWidth
                  required
                  value={weightsForm[rm.id] ?? rm.share}
                  onChange={e => setWeightsForm(f => ({ ...f, [rm.id]: e.target.value }))}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  inputProps={{ min: 0, max: 100, step: 0.5 }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditWeights(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Update</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        utility={selectedRoommate}
        onSuccess={() => {
          handleMarkAsPaid(selectedRoommate?.id);
          setPaymentModalOpen(false);
        }}
      />
    </Box>
  );
}
