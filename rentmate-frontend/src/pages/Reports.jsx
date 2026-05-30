import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Chip, List, ListItem, ListItemText, ListItemIcon, LinearProgress } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';

export default function Reports() {
  const [openReport, setOpenReport] = useState(false);
  const [success, setSuccess] = useState('');
  const [reportForm, setReportForm] = useState({ type: '', period: '', description: '' });

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setOpenReport(false);
    setSuccess('Report generated successfully!');
    setReportForm({ type: '', period: '', description: '' });
  };

  const reports = [
    { 
      id: 1, 
      title: 'Monthly Rent Summary', 
      type: 'Rent Analysis', 
      period: 'January 2024',
      status: 'completed',
      data: { totalRent: 20000, collected: 18000, outstanding: 2000 },
      trend: 'up',
      percentage: 90
    },
    { 
      id: 2, 
      title: 'Utility Bills Report', 
      type: 'Bills Analysis', 
      period: 'December 2023',
      status: 'completed',
      data: { totalBills: 5100, paid: 5100, outstanding: 0 },
      trend: 'up',
      percentage: 100
    },
    { 
      id: 3, 
      title: 'Payment History', 
      type: 'Payment Analysis', 
      period: 'Last 3 Months',
      status: 'pending',
      data: { totalPayments: 45000, completed: 42000, pending: 3000 },
      trend: 'down',
      percentage: 75
    },
    { 
      id: 4, 
      title: 'Roommate Spending', 
      type: 'Individual Analysis', 
      period: 'January 2024',
      status: 'completed',
      data: { totalSpent: 25000, average: 8333, highest: 10000 },
      trend: 'up',
      percentage: 85
    },
  ];

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />;
  };

  const getStatusColor = (status) => {
    return status === 'completed' ? 'success' : 'warning';
  };

  return (
    <Box sx={{ pt: 10, pb: 6, px: 2, background: 'linear-gradient(120deg, #f5f7fa 60%, #D9F0ED 100%)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, mb: 2, background: 'linear-gradient(90deg, #1a237e 0%, #3949ab 100%)', color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Reports & Analytics
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 3 }}>
          Generate detailed reports, track spending patterns, and get insights into your household finances.
        </Typography>
        <Button variant="contained" color="primary" size="large" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenReport(true)}>
          Generate Report
        </Button>
      </Box>

      {/* Analytics Summary Cards */}
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <MonetizationOnIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Total Rent</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="primary.main">₹20,000</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
              <LinearProgress variant="determinate" value={90} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ReceiptIcon color="secondary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Total Bills</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="secondary.main">₹5,100</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
              <LinearProgress variant="determinate" value={100} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <BarChartIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Savings</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="success.main">₹2,400</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
              <LinearProgress variant="determinate" value={75} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarTodayIcon color="info" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Reports</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="info.main">12</Typography>
              <Typography variant="body2" color="text.secondary">Generated</Typography>
              <LinearProgress variant="determinate" value={60} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports List */}
      <Grid container spacing={4} justifyContent="center">
        {reports.map((report) => (
          <Grid size={{ xs: 12, md: 6 }} key={report.id}>
            <Card sx={{ borderRadius: 4, boxShadow: 3, height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} mb={1}>{report.title}</Typography>
                    <Chip label={report.type} color="primary" size="small" sx={{ mr: 1 }} />
                    <Chip label={report.period} color="secondary" size="small" />
                  </Box>
                  {getTrendIcon(report.trend)}
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Progress: {report.percentage}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={report.percentage} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Total: ₹{report.data.totalRent || report.data.totalBills || report.data.totalPayments || report.data.totalSpent}
                  </Typography>
                  <Chip 
                    label={report.status} 
                    color={getStatusColor(report.status)} 
                    size="small" 
                  />
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button 
                    size="small" 
                    startIcon={<DownloadIcon />} 
                    variant="outlined"
                    sx={{ flex: 1 }}
                  >
                    Download
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<ShareIcon />} 
                    variant="outlined"
                    sx={{ flex: 1 }}
                  >
                    Share
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Generate Report Dialog */}
      <Dialog open={openReport} onClose={() => setOpenReport(false)}>
        <DialogTitle>Generate New Report</DialogTitle>
        <form onSubmit={handleReportSubmit}>
          <DialogContent sx={{ minWidth: 320 }}>
            <TextField 
              label="Report Type" 
              fullWidth 
              required 
              sx={{ mb: 2 }} 
              value={reportForm.type} 
              onChange={e => setReportForm({ ...reportForm, type: e.target.value })}
              placeholder="Rent Analysis, Bills Report, Payment History, etc."
            />
            <TextField 
              label="Time Period" 
              fullWidth 
              required 
              sx={{ mb: 2 }} 
              value={reportForm.period} 
              onChange={e => setReportForm({ ...reportForm, period: e.target.value })}
              placeholder="January 2024, Last 3 Months, etc."
            />
            <TextField 
              label="Description" 
              fullWidth 
              multiline 
              rows={3}
              sx={{ mb: 2 }} 
              value={reportForm.description} 
              onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
              placeholder="Optional description for the report"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReport(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Generate</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>{success}</Alert>
      </Snackbar>
    </Box>
  );
} 