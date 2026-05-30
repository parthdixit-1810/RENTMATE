import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Snackbar, Alert, Divider
} from '@mui/material';
import { Add as AddIcon, NorthEast as ArrowUpRightIcon } from '@mui/icons-material';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  Rent: '#14B8A6',
  Electricity: '#f59e0b',
  Water: '#0ea5e9',
  Internet: '#8b5cf6',
  Gas: '#f97316',
};

function loadPieData() {
  try {
    const bills = JSON.parse(localStorage.getItem('rm_utility_bills') || '[]');
    const roommates = JSON.parse(localStorage.getItem('rm_rent_roommates') || '[]');
    const rentTotal = roommates.reduce((s, r) => s + (r.amount || 0), 0);
    const byCategory = {};
    bills.forEach(b => { byCategory[b.category] = (byCategory[b.category] || 0) + b.amount; });
    const utilitySlices = Object.entries(byCategory).map(([name, value]) => ({
      name, value, color: CATEGORY_COLORS[name] || '#94a3b8',
    }));
    const slices = [];
    if (rentTotal > 0) slices.push({ name: 'Rent', value: rentTotal, color: CATEGORY_COLORS.Rent });
    slices.push(...utilitySlices);
    return slices;
  } catch {
    return [];
  }
}

const fmtINR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 1.5, px: 1.5, py: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#101827' }}>{name}</Typography>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#14B8A6' }}>{fmtINR(value)}</Typography>
      <Typography sx={{ fontSize: '0.7rem', color: '#4A5568' }}>{total > 0 ? (value / total * 100).toFixed(1) : 0}% of total</Typography>
    </Box>
  );
};

function StatCard({ label, value, sub, accent = '#14B8A6' }) {
  return (
    <Card
      sx={{
        borderTop: `3px solid ${accent}`,
        overflow: 'hidden',
        background: `linear-gradient(145deg, #fff 60%, ${accent}0D 100%)`,
      }}
    >
      <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A0B4B8', display: 'block', mb: 2.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '2.25rem', color: '#1A2E2D', letterSpacing: '-0.03em', lineHeight: 1, mb: 1.25 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: '#A0B4B8', fontWeight: 500 }}>{sub}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const pieData = useMemo(() => loadPieData(), []);
  const pieTotal = useMemo(() => pieData.reduce((s, d) => s + d.value, 0), [pieData]);

  const rentTotal = useMemo(() => {
    try {
      const roommates = JSON.parse(localStorage.getItem('rm_rent_roommates') || '[]');
      return roommates.reduce((s, r) => s + (r.amount || 0), 0);
    } catch { return 0; }
  }, []);

  const utilityTotal = useMemo(() => {
    try {
      const bills = JSON.parse(localStorage.getItem('rm_utility_bills') || '[]');
      return bills.reduce((s, b) => s + b.amount, 0);
    } catch { return 0; }
  }, []);

  const recentActivity = useMemo(() => {
    try {
      const bills = JSON.parse(localStorage.getItem('rm_utility_bills') || '[]');
      const roommates = JSON.parse(localStorage.getItem('rm_rent_roommates') || '[]');
      const items = [
        ...bills.map(b => ({ text: `${b.category || 'Bill'} — ${fmtINR(b.amount)}`, status: b.status, dot: b.status === 'paid' ? '#059669' : '#dc2626' })),
        ...roommates.filter(r => r.status === 'paid').map(r => ({ text: `Rent paid — ${fmtINR(r.amount || 0)}`, status: 'paid', dot: '#059669' })),
      ];
      return items.slice(-3).reverse();
    } catch { return []; }
  }, []);

  const paidTotal = useMemo(() => {
    try {
      const bills = JSON.parse(localStorage.getItem('rm_utility_bills') || '[]');
      const roommates = JSON.parse(localStorage.getItem('rm_rent_roommates') || '[]');
      return bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0)
           + roommates.filter(r => r.status === 'paid').reduce((s, r) => s + (r.amount || 0), 0);
    } catch { return 0; }
  }, []);

  const pendingTotal = rentTotal + utilityTotal - paidTotal;

  const [openRent, setOpenRent] = useState(false);
  const [openBill, setOpenBill] = useState(false);
  const [success, setSuccess] = useState('');
  const [rentForm, setRentForm] = useState({ amount: '', due: '' });
  const [billForm, setBillForm] = useState({ type: '', amount: '', due: '' });

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%', boxSizing: 'border-box' }}>

      {/* Page header */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #101827 0%, #101827 60%, #14B8A622 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blur orb */}
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(20,184,166,0.18)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#FDFCFA', letterSpacing: '-0.03em', position: 'relative' }}>
          Good morning 👋
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: '#6B8C95', mt: 0.5, position: 'relative' }}>
          Here's your household financial summary for this month.
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Rent due" value={fmtINR(rentTotal)} sub="This month" accent="#14B8A6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Utilities" value={fmtINR(utilityTotal)} sub="Across all categories" accent="#FBBF24" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Paid" value={fmtINR(paidTotal)} sub="Settled this month" accent="#14B8A6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Outstanding" value={fmtINR(Math.max(0, pendingTotal))} sub="Remaining to pay" accent="#E76F51" />
        </Grid>
      </Grid>

      {/* Chart + Actions */}
      <Grid container spacing={3}>
        {/* Expense chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#101827' }}>
                    Expense breakdown
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#6B8C95', mt: 0.25 }}>
                    Rent vs utilities
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#101827' }}>
                  {fmtINR(pieTotal)}
                </Typography>
              </Box>

              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {pieData.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip total={pieTotal} />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                {pieData.map(d => (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: d.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: '#2D3748', fontWeight: 500 }}>{d.name}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6B8C95' }}>
                      {pieTotal > 0 ? (d.value / pieTotal * 100).toFixed(0) : 0}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick actions + activity */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#101827', mb: 2 }}>
                Quick actions
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'View rent', sub: 'Manage roommate splits', path: '/rent', color: '#14B8A6', bg: 'rgba(20,184,166,0.10)' },
                  { label: 'Add utility bill', sub: 'Log electricity, water, internet', path: '/utilities', color: '#D97706', bg: 'rgba(251,191,36,0.15)' },
                  { label: 'Rooms & roommates', sub: 'Manage household members', path: '/rooms', color: '#1E4D5E', bg: 'rgba(61,107,125,0.10)' },
                  { label: 'Payment history', sub: 'Audit log and exports', path: '/history', color: '#6B8C95', bg: 'rgba(138,173,181,0.12)' },
                ].map(item => (
                  <Box
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.75,
                      borderRadius: '10px',
                      border: '1px solid #EEE9E2',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      '&:hover': { borderColor: item.color + '55', bgcolor: item.bg, transform: 'translateX(3px)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A2E2D', lineHeight: 1.2, letterSpacing: '-0.005em' }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6B8C95', mt: 0.2, fontWeight: 500 }}>
                          {item.sub}
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowUpRightIcon sx={{ fontSize: 15, color: '#C8D4D8', transition: 'color 0.18s', flexShrink: 0 }} />
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="overline" sx={{ color: '#6B8C95', display: 'block', mb: 1.5 }}>
                Recent
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {recentActivity.length === 0 ? (
                  <Typography sx={{ fontSize: '0.8125rem', color: '#A0B4B8', fontStyle: 'italic' }}>
                    No recent activity yet.
                  </Typography>
                ) : recentActivity.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: item.dot, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.8125rem', color: '#2D3748', lineHeight: 1.25 }}>{item.text}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FAB */}
      <Box
        component="button"
        onClick={() => setOpenRent(true)}
        aria-label="Add rent"
        sx={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1100,
          width: 48, height: 48, borderRadius: '50%',
          bgcolor: '#14B8A6', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s, box-shadow 0.15s',
          '&:hover': { transform: 'scale(1.06)', boxShadow: '0 6px 20px rgba(20,184,166,0.45)' },
        }}
      >
        <AddIcon sx={{ color: '#fff', fontSize: 22 }} />
      </Box>

      {/* Add Rent Dialog */}
      <Dialog open={openRent} onClose={() => setOpenRent(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Rent</DialogTitle>
        <form onSubmit={e => { e.preventDefault(); setOpenRent(false); setSuccess('Rent entry added.'); setRentForm({ amount: '', due: '' }); }}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                required
                value={rentForm.amount}
                onChange={e => setRentForm({ ...rentForm, amount: e.target.value })}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: '#6B8C95', fontSize: '0.875rem' }}>₹</Typography> }}
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
            <Button onClick={() => setOpenRent(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Rent</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Bill Dialog */}
      <Dialog open={openBill} onClose={() => setOpenBill(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Utility Bill</DialogTitle>
        <form onSubmit={e => { e.preventDefault(); setOpenBill(false); setSuccess('Bill added.'); setBillForm({ type: '', amount: '', due: '' }); }}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <TextField
                label="Category"
                fullWidth
                required
                placeholder="Electricity, Water, Internet..."
                value={billForm.type}
                onChange={e => setBillForm({ ...billForm, type: e.target.value })}
              />
              <TextField
                label="Amount"
                type="number"
                fullWidth
                required
                value={billForm.amount}
                onChange={e => setBillForm({ ...billForm, amount: e.target.value })}
                InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: '#6B8C95', fontSize: '0.875rem' }}>₹</Typography> }}
              />
              <TextField
                label="Due date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={billForm.due}
                onChange={e => setBillForm({ ...billForm, due: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBill(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Bill</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={!!success} autoHideDuration={3500} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
