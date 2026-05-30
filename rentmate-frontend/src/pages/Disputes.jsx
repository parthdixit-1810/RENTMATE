import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, InputAdornment,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, Fab, Grid, Divider,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CATEGORIES = ['Electricity', 'Water', 'Internet', 'Gas', 'Rent', 'Other'];

const fmtINR = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

function DisputeCard({ dispute, onResolve, onNoteChange }) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteVal, setNoteVal] = useState(dispute.notes || '');

  const handleSaveNote = () => {
    onNoteChange(dispute.id, noteVal);
    setEditingNote(false);
  };

  return (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${dispute.status === 'resolved' ? '#D1FAE5' : '#FEE2E2'}`,
        borderLeft: `4px solid ${dispute.status === 'resolved' ? '#14B8A6' : '#EF4444'}`,
        opacity: dispute.status === 'resolved' ? 0.75 : 1,
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#101827' }}>
                {dispute.title || dispute.category}
              </Typography>
              <Chip
                label={dispute.category}
                size="small"
                sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontSize: '0.7rem', height: 20 }}
              />
              <Chip
                label={dispute.status === 'resolved' ? 'Resolved' : 'Open'}
                size="small"
                sx={{
                  bgcolor: dispute.status === 'resolved' ? '#D1FAE5' : '#FEE2E2',
                  color: dispute.status === 'resolved' ? '#065F46' : '#991B1B',
                  fontWeight: 700, fontSize: '0.7rem', height: 20,
                }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280' }}>
              {dispute.description || '—'}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: '#EF4444', whiteSpace: 'nowrap' }}>
            {fmtINR(dispute.amount)}
          </Typography>
        </Box>

        {/* Notes section */}
        <Box sx={{ mt: 1.5 }}>
          {editingNote ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                size="small"
                multiline
                rows={2}
                fullWidth
                value={noteVal}
                onChange={e => setNoteVal(e.target.value)}
                placeholder="Add notes about this dispute..."
                autoFocus
              />
              <IconButton size="small" onClick={handleSaveNote} sx={{ color: '#14B8A6', mt: 0.5 }}>
                <SaveIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.8125rem', color: dispute.notes ? '#374151' : '#9CA3AF', fontStyle: dispute.notes ? 'normal' : 'italic', flex: 1 }}>
                {dispute.notes || 'No notes added'}
              </Typography>
              <IconButton size="small" onClick={() => setEditingNote(true)} sx={{ color: '#9CA3AF', '&:hover': { color: '#14B8A6' } }}>
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {dispute.status !== 'resolved' && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
                onClick={() => onResolve(dispute.id)}
                sx={{ bgcolor: '#14B8A6', '&:hover': { bgcolor: '#0d9488' }, fontSize: '0.8125rem' }}
              >
                Resolve
              </Button>
            </Box>
          </>
        )}

        {dispute.resolvedAt && (
          <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', mt: 1 }}>
            Resolved on {new Date(dispute.resolvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function Disputes() {
  const [bills, setBills] = useLocalStorage('rm_utility_bills', []);
  const [manualDisputes, setManualDisputes] = useLocalStorage('rm_disputes', []);
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', description: '', category: 'Other' });
  const [snack, setSnack] = useState('');

  // Disputes from bills
  const billDisputes = (bills || [])
    .filter(b => b.disputed)
    .map(b => ({
      id: `bill_${b.id}`,
      title: b.category,
      category: b.category,
      amount: b.amount,
      description: b.description || '',
      status: b.disputeResolved ? 'resolved' : 'open',
      notes: b.disputeNotes || '',
      source: 'bill',
      billId: b.id,
      resolvedAt: b.disputeResolvedAt || null,
    }));

  const allDisputes = [...billDisputes, ...(manualDisputes || [])];
  const openDisputes = allDisputes.filter(d => d.status !== 'resolved');
  const resolvedDisputes = allDisputes.filter(d => d.status === 'resolved');

  const handleResolve = (id) => {
    if (id.startsWith('bill_')) {
      const billId = parseInt(id.replace('bill_', ''));
      setBills(prev => prev.map(b =>
        b.id === billId ? { ...b, disputeResolved: true, disputeResolvedAt: new Date().toISOString() } : b
      ));
    } else {
      setManualDisputes(prev => (prev || []).map(d =>
        d.id === id ? { ...d, status: 'resolved', resolvedAt: new Date().toISOString() } : d
      ));
    }
    setSnack('Dispute marked as resolved.');
  };

  const handleNoteChange = (id, notes) => {
    if (id.startsWith('bill_')) {
      const billId = parseInt(id.replace('bill_', ''));
      setBills(prev => prev.map(b => b.id === billId ? { ...b, disputeNotes: notes } : b));
    } else {
      setManualDisputes(prev => (prev || []).map(d => d.id === id ? { ...d, notes } : d));
    }
  };

  const handleAddDispute = (e) => {
    e.preventDefault();
    if (!form.title) return;
    const newDispute = {
      id: `manual_${Date.now()}`,
      title: form.title,
      amount: parseFloat(form.amount) || 0,
      description: form.description,
      category: form.category,
      status: 'open',
      notes: '',
      source: 'manual',
      createdAt: new Date().toISOString(),
    };
    setManualDisputes(prev => [newDispute, ...(prev || [])]);
    setForm({ title: '', amount: '', description: '', category: 'Other' });
    setOpenAdd(false);
    setSnack('Dispute added.');
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, pb: 10 }}>
      {/* Hero Header */}
      <Box
        sx={{
          mb: 3.5, p: 3, borderRadius: '16px',
          background: 'linear-gradient(135deg, #101827 0%, #101827 60%, #EF444422 100%)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(239,68,68,0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <GavelIcon sx={{ color: '#FBBF24', fontSize: 28 }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#FDFCFA', letterSpacing: '-0.03em' }}>
              Disputes
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#6B8C95', mt: 0.5 }}>
              Track and resolve billing disputes
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        {[
          { label: 'Total disputes', value: allDisputes.length, accent: '#1E4D5E' },
          { label: 'Open', value: openDisputes.length, accent: '#EF4444' },
          { label: 'Resolved', value: resolvedDisputes.length, accent: '#14B8A6' },
        ].map(s => (
          <Card key={s.label} sx={{ borderTop: `3px solid ${s.accent}` }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A0B4B8', mb: 1 }}>{s.label}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.75rem', color: '#1A2E2D', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Open disputes */}
      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2 }}>
        Open ({openDisputes.length})
      </Typography>

      {openDisputes.length === 0 ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ py: 5, textAlign: 'center' }}>
            <GavelIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1.5 }} />
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#6B7280' }}>No open disputes</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#9CA3AF', mt: 0.5 }}>
              Flag a bill from the Utilities page or click + to add one manually
            </Typography>
          </CardContent>
        </Card>
      ) : (
        openDisputes.map(d => (
          <DisputeCard key={d.id} dispute={d} onResolve={handleResolve} onNoteChange={handleNoteChange} />
        ))
      )}

      {/* Resolved disputes */}
      {resolvedDisputes.length > 0 && (
        <>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 2, mt: 3 }}>
            Resolved ({resolvedDisputes.length})
          </Typography>
          {resolvedDisputes.map(d => (
            <DisputeCard key={d.id} dispute={d} onResolve={handleResolve} onNoteChange={handleNoteChange} />
          ))}
        </>
      )}

      {/* FAB */}
      <Fab
        color="primary"
        onClick={() => setOpenAdd(true)}
        sx={{
          position: 'fixed', bottom: 32, right: 32,
          bgcolor: '#101827', '&:hover': { bgcolor: '#1F2937' },
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Dispute Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Dispute</DialogTitle>
        <form onSubmit={handleAddDispute}>
          <DialogContent>
            <TextField
              label="Title"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Incorrect electricity charge"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Amount"
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  label="Category"
                >
                  {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the dispute..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add dispute</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="success" onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
}
