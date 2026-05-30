import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  TextField, Select, MenuItem, FormControl, InputLabel, Chip,
  Snackbar, Alert, Tabs, Tab, CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import HistoryIcon from '@mui/icons-material/History';
import api from '../api';

const RENT_HISTORY = [
  { id: 1, date: '2024-01-05', roommate: 'John Doe', amount: 4800, status: 'paid', method: 'Bank Transfer' },
  { id: 2, date: '2024-01-10', roommate: 'Jane Smith', amount: 3600, status: 'paid', method: 'UPI' },
  { id: 3, date: '2024-01-15', roommate: 'Mike Johnson', amount: 3600, status: 'pending', method: 'Credit Card' },
  { id: 4, date: '2023-12-05', roommate: 'John Doe', amount: 4800, status: 'paid', method: 'Bank Transfer' },
  { id: 5, date: '2023-12-10', roommate: 'Jane Smith', amount: 3600, status: 'paid', method: 'UPI' },
  { id: 6, date: '2023-12-15', roommate: 'Mike Johnson', amount: 3600, status: 'paid', method: 'Credit Card' },
  { id: 7, date: '2023-11-05', roommate: 'John Doe', amount: 4800, status: 'paid', method: 'Bank Transfer' },
  { id: 8, date: '2023-11-10', roommate: 'Jane Smith', amount: 3600, status: 'paid', method: 'UPI' },
];

const UTILITY_HISTORY = [
  { id: 1, date: '2024-01-15', category: 'Electricity', amount: 2500, status: 'paid', splitMethod: 'Equal' },
  { id: 2, date: '2024-01-20', category: 'Water', amount: 800, status: 'pending', splitMethod: 'Equal' },
  { id: 3, date: '2024-01-10', category: 'Internet', amount: 1200, status: 'overdue', splitMethod: 'Equal' },
  { id: 4, date: '2023-12-15', category: 'Electricity', amount: 2300, status: 'paid', splitMethod: 'Equal' },
  { id: 5, date: '2023-12-20', category: 'Water', amount: 750, status: 'paid', splitMethod: 'Equal' },
  { id: 6, date: '2023-12-10', category: 'Internet', amount: 1200, status: 'paid', splitMethod: 'Equal' },
  { id: 7, date: '2023-11-15', category: 'Gas', amount: 600, status: 'paid', splitMethod: 'Equal' },
];

const STATUS_DOT = { paid: '#14B8A6', pending: '#D97706', overdue: '#E76F51' };
const STATUS_TEXT = { paid: '#14B8A6', pending: '#B45309', overdue: '#C45030' };

function StatusDot({ status }) {
  const dot = STATUS_DOT[status] || '#6B8C95';
  const txt = STATUS_TEXT[status] || '#4A5568';
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: txt, textTransform: 'capitalize' }}>{status}</Typography>
    </Box>
  );
}

const fmtINR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

const DATE_RANGES = {
  lastmonth: 30,
  last3months: 90,
  last6months: 180,
  lastyear: 365,
  all: Infinity,
};

function downloadCSV(filename, rows, headers) {
  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h.toLowerCase().replace(/ /g, '_')] ?? r[Object.keys(r).find(k => k.toLowerCase() === h.toLowerCase())])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ACTION_LABELS = {
  SPLIT_CHANGED: { label: 'Split Changed', color: 'warning' },
  MARKED_PAID:   { label: 'Marked Paid',   color: 'success' },
  BILL_ADDED:    { label: 'Bill Added',     color: 'info' },
  RENT_SET:      { label: 'Rent Set',       color: 'primary' },
};

export default function History() {
  const [tab, setTab] = useState(0);
  const [dateRange, setDateRange] = useState('last3months');
  const [searchQuery, setSearchQuery] = useState('');
  const [success, setSuccess] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    if (tab !== 2) return;
    setAuditLoading(true);
    api.get('/api/audit-logs')
      .then(res => setAuditLogs(res.data || []))
      .catch(() => setAuditLogs([]))
      .finally(() => setAuditLoading(false));
  }, [tab]);

  const cutoffDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - (DATE_RANGES[dateRange] ?? Infinity));
    return d;
  }, [dateRange]);

  const filteredRent = useMemo(() =>
    RENT_HISTORY.filter(item => {
      const withinRange = DATE_RANGES[dateRange] === Infinity || new Date(item.date) >= cutoffDate;
      const matchSearch = item.roommate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.method.toLowerCase().includes(searchQuery.toLowerCase());
      return withinRange && matchSearch;
    }),
    [dateRange, searchQuery, cutoffDate]
  );

  const filteredUtility = useMemo(() =>
    UTILITY_HISTORY.filter(item => {
      const withinRange = DATE_RANGES[dateRange] === Infinity || new Date(item.date) >= cutoffDate;
      const matchSearch = item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return withinRange && matchSearch;
    }),
    [dateRange, searchQuery, cutoffDate]
  );

  const handleExportRent = () => {
    downloadCSV('rent-history.csv', filteredRent, ['Date', 'Roommate', 'Amount', 'Method', 'Status']);
    setSuccess('Rent history exported as CSV.');
  };

  const handleExportUtility = () => {
    downloadCSV('utility-history.csv', filteredUtility, ['Date', 'Category', 'Amount', 'SplitMethod', 'Status']);
    setSuccess('Utility history exported as CSV.');
  };

  const handleExportAll = () => {
    tab === 0 ? handleExportRent() : handleExportUtility();
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
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(20,184,166,0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.625rem', color: '#FDFCFA', letterSpacing: '-0.03em' }}>
            History
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#6B8C95', mt: 0.5 }}>
            All rent and utility payment records
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon sx={{ fontSize: 15 }} />}
          onClick={handleExportAll}
          sx={{ position: 'relative', borderColor: 'rgba(255,255,255,0.25)', color: '#CBD5D8', '&:hover': { borderColor: 'rgba(255,255,255,0.45)', bgcolor: 'rgba(255,255,255,0.07)' } }}
        >
          Export CSV
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid #eaeff5' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Date Range</InputLabel>
              <Select value={dateRange} onChange={e => setDateRange(e.target.value)} label="Date Range">
                <MenuItem value="lastmonth">Last Month</MenuItem>
                <MenuItem value="last3months">Last 3 Months</MenuItem>
                <MenuItem value="last6months">Last 6 Months</MenuItem>
                <MenuItem value="lastyear">Last Year</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
              placeholder={tab === 0 ? 'Name or method…' : 'Category…'}
            />
            {searchQuery && (
              <Button
                size="small"
                startIcon={<FilterListIcon />}
                onClick={() => setSearchQuery('')}
                sx={{ textTransform: 'none' }}
              >
                Clear
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
      >
        <Tab label={`Rent (${filteredRent.length})`} />
        <Tab label={`Utilities (${filteredUtility.length})`} />
        <Tab label="Audit Log" icon={<HistoryIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <Card sx={{ borderRadius: 3, border: '1px solid #eaeff5' }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5, pb: 1.5 }}>
              <Typography variant="h6" fontWeight={700}>Rent Payments</Typography>
              <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportRent} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Export
              </Button>
            </Box>
            {filteredRent.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 10px', display: 'block' }}>
                  <circle cx="24" cy="24" r="24" fill="#f5f7fa" />
                  <path d="M14 30h20M16 22h16M18 26h12" stroke="#c5cae9" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <Typography variant="body2">No records match your filters.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9F6F0', '& th': { fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', borderBottom: '1px solid #eaeff5', py: 1.25 } }}>
                      <TableCell>Date</TableCell>
                      <TableCell>Roommate</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRent.map(item => (
                      <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#fafbff' }, '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{item.roommate}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="primary.main">{fmtINR(item.amount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{item.method}</Typography>
                        </TableCell>
                        <TableCell>
                          <StatusDot status={item.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card sx={{ borderRadius: 3, border: '1px solid #eaeff5' }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5, pb: 1.5 }}>
              <Typography variant="h6" fontWeight={700}>Utility Payments</Typography>
              <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportUtility} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Export
              </Button>
            </Box>
            {filteredUtility.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 10px', display: 'block' }}>
                  <circle cx="24" cy="24" r="24" fill="#f5f7fa" />
                  <path d="M14 30h20M16 22h16M18 26h12" stroke="#c5cae9" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <Typography variant="body2">No records match your filters.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9F6F0', '& th': { fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', borderBottom: '1px solid #eaeff5', py: 1.25 } }}>
                      <TableCell>Date</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Split</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUtility.map(item => (
                      <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#fafbff' }, '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{item.category}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="primary.main">{fmtINR(item.amount)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={item.splitMethod} color="primary" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <StatusDot status={item.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{ borderRadius: 3, border: '1px solid #eaeff5' }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pt: 2.5, pb: 1.5 }}>
              <HistoryIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={700}>Split &amp; Payment Audit Log</Typography>
            </Box>
            {auditLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={32} />
              </Box>
            ) : auditLogs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 10px', display: 'block' }}>
                  <circle cx="24" cy="24" r="24" fill="#f5f7fa" />
                  <path d="M14 16h20v16H14z" stroke="#c5cae9" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M18 22h12M18 26h8" stroke="#c5cae9" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <Typography variant="body2">No audit log entries yet. Actions on Rent and Utilities will appear here.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9F6F0', '& th': { fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', borderBottom: '1px solid #eaeff5', py: 1.25 } }}>
                      <TableCell>Time</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>By</TableCell>
                      <TableCell>Change</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.map(log => {
                      const actionMeta = ACTION_LABELS[log.action] || { label: log.action, color: 'default' };
                      return (
                        <TableRow key={log.id} sx={{ '&:hover': { bgcolor: '#fafbff' }, '&:last-child td': { border: 0 } }}>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={actionMeta.label} color={actionMeta.color} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                          </TableCell>
                          <TableCell>
                            <Chip label={log.entityType || '—'} variant="outlined" size="small" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{log.description || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">{log.userEmail || 'Guest'}</Typography>
                          </TableCell>
                          <TableCell>
                            {(log.oldValue || log.newValue) && (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                {log.oldValue && <Typography variant="caption" color="text.disabled" sx={{ textDecoration: 'line-through' }}>{log.oldValue}</Typography>}
                                {log.newValue && <Typography variant="caption" color="success.main" fontWeight={600}>{log.newValue}</Typography>}
                              </Box>
                            )}
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
      )}

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
