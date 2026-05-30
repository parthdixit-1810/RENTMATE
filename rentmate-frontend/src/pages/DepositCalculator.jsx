import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Grid, InputAdornment, IconButton, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useLocalStorage } from '../hooks/useLocalStorage';

const fmtINR = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DEFAULT_DATA = {
  totalDeposit: '',
  roommateCount: '',
  moveOutDate: '',
  deductions: [],
};

export default function DepositCalculator() {
  const [data, setData] = useLocalStorage('rm_deposit_data', DEFAULT_DATA);
  const [deductionForm, setDeductionForm] = useState({ description: '', amount: '' });
  const [showDeductionForm, setShowDeductionForm] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [snack, setSnack] = useState('');

  const totalDeposit = parseFloat(data.totalDeposit) || 0;
  const roommateCount = Math.max(1, parseInt(data.roommateCount) || 1);
  const perPersonDeposit = totalDeposit / roommateCount;
  const totalDeductions = (data.deductions || []).reduce((s, d) => s + parseFloat(d.amount || 0), 0);
  const netRefund = totalDeposit - totalDeductions;
  const perPersonRefund = netRefund / roommateCount;

  const handleAddDeduction = () => {
    if (!deductionForm.description || !deductionForm.amount) return;
    setData(prev => ({
      ...prev,
      deductions: [
        ...(prev.deductions || []),
        { id: Date.now(), description: deductionForm.description, amount: parseFloat(deductionForm.amount) },
      ],
    }));
    setDeductionForm({ description: '', amount: '' });
    setShowDeductionForm(false);
    setSnack('Deduction added.');
  };

  const handleDeleteDeduction = (id) => {
    setData(prev => ({ ...prev, deductions: prev.deductions.filter(d => d.id !== id) }));
  };

  const generateSummaryText = () => {
    const lines = [
      'DEPOSIT SETTLEMENT SUMMARY',
      '==========================',
      `Total Deposit:      ${fmtINR(totalDeposit)}`,
      `Roommates:          ${roommateCount}`,
      `Per-person deposit: ${fmtINR(perPersonDeposit)}`,
      `Move-out Date:      ${data.moveOutDate || 'Not set'}`,
      '',
      'DEDUCTIONS',
      '----------',
      ...(data.deductions || []).map(d => `  ${d.description}: ${fmtINR(d.amount)}`),
      `Total Deductions:   ${fmtINR(totalDeductions)}`,
      '',
      'SETTLEMENT',
      '----------',
      `Net Refund:         ${fmtINR(netRefund)}`,
      `Per-person Refund:  ${fmtINR(perPersonRefund)}`,
      '',
      `Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    ];
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateSummaryText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Hero Header */}
      <Box
        sx={{
          mb: 3.5, p: 3, borderRadius: '16px',
          background: 'linear-gradient(135deg, #101827 0%, #101827 60%, #14B8A622 100%)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(20,184,166,0.18)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CalculateIcon sx={{ color: '#14B8A6', fontSize: 28 }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#FDFCFA', letterSpacing: '-0.03em' }}>
              Deposit Calculator
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#6B8C95', mt: 0.5 }}>
              Calculate deposit refunds and deductions for move-out
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Two-column layout */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* LEFT — Deposit Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#101827', mb: 2.5 }}>
                Deposit Details
              </Typography>

              <TextField
                label="Total deposit amount"
                type="number"
                fullWidth
                sx={{ mb: 2 }}
                value={data.totalDeposit}
                onChange={e => setData(prev => ({ ...prev, totalDeposit: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                placeholder="0"
              />

              <TextField
                label="Number of roommates"
                type="number"
                fullWidth
                sx={{ mb: 2 }}
                value={data.roommateCount}
                onChange={e => setData(prev => ({ ...prev, roommateCount: e.target.value }))}
                inputProps={{ min: 1, step: 1 }}
                placeholder="1"
              />

              <TextField
                label="Per-person deposit contribution"
                fullWidth
                sx={{ mb: 2 }}
                value={totalDeposit > 0 ? fmtINR(perPersonDeposit) : ''}
                InputProps={{
                  readOnly: true,
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  sx: { bgcolor: '#F9FAFB', color: '#4A5568' },
                }}
                placeholder="Auto-calculated"
                helperText="Calculated as total deposit ÷ roommate count"
              />

              <TextField
                label="Move-out date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={data.moveOutDate}
                onChange={e => setData(prev => ({ ...prev, moveOutDate: e.target.value }))}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT — Deductions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#101827' }}>
                  Deductions
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                  variant="outlined"
                  onClick={() => setShowDeductionForm(v => !v)}
                  sx={{ fontSize: '0.8125rem' }}
                >
                  Add deduction
                </Button>
              </Box>

              {showDeductionForm && (
                <Box sx={{ mb: 2, p: 2, bgcolor: '#F0FDFA', borderRadius: 2, border: '1px solid #99F6E4' }}>
                  <TextField
                    label="Description"
                    size="small"
                    fullWidth
                    sx={{ mb: 1.5 }}
                    value={deductionForm.description}
                    onChange={e => setDeductionForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. Wall damage repair"
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    size="small"
                    fullWidth
                    sx={{ mb: 1.5 }}
                    value={deductionForm.amount}
                    onChange={e => setDeductionForm(f => ({ ...f, amount: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" onClick={handleAddDeduction} sx={{ fontSize: '0.8125rem' }}>
                      Add
                    </Button>
                    <Button size="small" onClick={() => { setShowDeductionForm(false); setDeductionForm({ description: '', amount: '' }); }}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}

              {(data.deductions || []).length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: '#9CA3AF' }}>No deductions added yet</Typography>
                </Box>
              ) : (
                <Box>
                  {(data.deductions || []).map((d) => (
                    <Box
                      key={d.id}
                      sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        py: 1, borderBottom: '1px solid #F3F4F6',
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#1F2937' }}>{d.description}</Typography>
                        <Typography sx={{ fontSize: '0.8125rem', color: '#EF4444', fontWeight: 600 }}>{fmtINR(d.amount)}</Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleDeleteDeduction(d.id)} sx={{ color: '#9CA3AF', '&:hover': { color: '#EF4444' } }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {(data.deductions || []).length > 0 && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#374151' }}>Total deductions</Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#EF4444' }}>{fmtINR(totalDeductions)}</Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settlement Summary — full width */}
      <Card sx={{ borderTop: `3px solid ${netRefund >= 0 ? '#14B8A6' : '#EF4444'}` }}>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#101827', mb: 2.5 }}>
            Settlement Summary
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, mb: 3 }}>
            <Table size="small">
              <TableBody>
                {[
                  { label: 'Total deposit', value: fmtINR(totalDeposit), color: '#1F2937' },
                  { label: 'Total deductions', value: `- ${fmtINR(totalDeductions)}`, color: '#EF4444' },
                  { label: 'Net refund', value: fmtINR(netRefund), color: netRefund >= 0 ? '#059669' : '#EF4444', bold: true },
                  { label: `Per-person refund (÷ ${roommateCount})`, value: fmtINR(perPersonRefund), color: perPersonRefund >= 0 ? '#059669' : '#EF4444', bold: true },
                ].map((row, i) => (
                  <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: row.bold ? 600 : 400, py: 1.25 }}>
                      {row.label}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontSize: row.bold ? '1rem' : '0.875rem',
                        fontWeight: row.bold ? 800 : 600,
                        color: row.color,
                        py: 1.25,
                      }}
                    >
                      {row.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Net refund big display */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', mb: 0.5 }}>
                Each roommate receives
              </Typography>
              <Typography sx={{
                fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em',
                color: perPersonRefund >= 0 ? '#059669' : '#EF4444',
              }}>
                {fmtINR(perPersonRefund)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
              onClick={() => setSummaryOpen(true)}
              sx={{ bgcolor: '#101827', '&:hover': { bgcolor: '#1F2937' } }}
            >
              Generate summary
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Dialog */}
      <Dialog open={summaryOpen} onClose={() => setSummaryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Deposit Settlement Summary</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              fontFamily: 'monospace', fontSize: '0.8125rem',
              bgcolor: '#F9FAFB', p: 2, borderRadius: 2,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              border: '1px solid #E5E7EB', color: '#1F2937', lineHeight: 1.7,
            }}
          >
            {generateSummaryText()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSummaryOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
            onClick={handleCopy}
            sx={{ bgcolor: copied ? '#059669' : '#14B8A6', '&:hover': { bgcolor: '#0d9488' } }}
          >
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="success" onClose={() => setSnack('')}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
}
