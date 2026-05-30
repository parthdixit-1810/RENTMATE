import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Chip, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WifiIcon from '@mui/icons-material/Wifi';

export default function Bills() {
  const [openBill, setOpenBill] = useState(false);
  const [success, setSuccess] = useState('');
  const [billForm, setBillForm] = useState({ type: '', amount: '', due: '', description: '' });

  const handleBillSubmit = (e) => {
    e.preventDefault();
    setOpenBill(false);
    setSuccess('Bill added successfully!');
    setBillForm({ type: '', amount: '', due: '', description: '' });
  };

  const getBillIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'electricity': return <ElectricBoltIcon />;
      case 'water': return <WaterDropIcon />;
      case 'internet': return <WifiIcon />;
      default: return <ReceiptIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'overdue': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon />;
      case 'overdue': return <WarningIcon />;
      case 'pending': return <ScheduleIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const bills = [
    { id: 1, type: 'Electricity', amount: 2500, due: '2024-01-15', status: 'paid', description: 'December 2023 bill' },
    { id: 2, type: 'Water', amount: 800, due: '2024-01-20', status: 'pending', description: 'December 2023 bill' },
    { id: 3, type: 'Internet', amount: 1200, due: '2024-01-10', status: 'overdue', description: 'December 2023 bill' },
    { id: 4, type: 'Gas', amount: 600, due: '2024-01-25', status: 'pending', description: 'December 2023 bill' },
  ];

  return (
    <Box sx={{ pt: 10, pb: 6, px: 2, background: 'linear-gradient(120deg, #f5f7fa 60%, #D9F0ED 100%)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, mb: 2, background: 'linear-gradient(90deg, #1a237e 0%, #3949ab 100%)', color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Bills & Utilities
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 3 }}>
          Track and manage all your utility bills. Add new bills, track payments, and never miss a due date.
        </Typography>
        <Button variant="contained" color="primary" size="large" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenBill(true)}>
          Add Bill
        </Button>
      </Box>

      {/* Bills Summary Cards */}
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ReceiptIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Total Bills</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="primary.main">₹5,100</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircleIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Paid</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="success.main">₹2,500</Typography>
              <Typography variant="body2" color="text.secondary">1 bill paid</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ScheduleIcon color="warning" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Pending</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="warning.main">₹2,600</Typography>
              <Typography variant="body2" color="text.secondary">2 bills pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <WarningIcon color="error" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Overdue</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="error.main">₹1,200</Typography>
              <Typography variant="body2" color="text.secondary">1 bill overdue</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bills List */}
      <Card sx={{ borderRadius: 4, boxShadow: 3, maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={3}>Recent Bills</Typography>
          <List>
            {bills.map((bill) => (
              <ListItem key={bill.id} sx={{ border: '1px solid #e0e7ef', borderRadius: 2, mb: 2 }}>
                <ListItemIcon>
                  {getBillIcon(bill.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={600}>{bill.type}</Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">₹{bill.amount}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        Due: {new Date(bill.due).toLocaleDateString()} • {bill.description}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(bill.status)}
                        label={bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        color={getStatusColor(bill.status)}
                        size="small"
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Add Bill Dialog */}
      <Dialog open={openBill} onClose={() => setOpenBill(false)}>
        <DialogTitle>Add New Bill</DialogTitle>
        <form onSubmit={handleBillSubmit}>
          <DialogContent sx={{ minWidth: 320 }}>
            <TextField 
              label="Bill Type" 
              fullWidth 
              required 
              sx={{ mb: 2 }} 
              value={billForm.type} 
              onChange={e => setBillForm({ ...billForm, type: e.target.value })}
              placeholder="Electricity, Water, Internet, etc."
            />
            <TextField 
              label="Amount" 
              type="number" 
              fullWidth 
              required 
              sx={{ mb: 2 }} 
              value={billForm.amount} 
              onChange={e => setBillForm({ ...billForm, amount: e.target.value })}
            />
            <TextField 
              label="Due Date" 
              type="date" 
              fullWidth 
              required 
              sx={{ mb: 2 }} 
              InputLabelProps={{ shrink: true }} 
              value={billForm.due} 
              onChange={e => setBillForm({ ...billForm, due: e.target.value })}
            />
            <TextField 
              label="Description" 
              fullWidth 
              sx={{ mb: 2 }} 
              value={billForm.description} 
              onChange={e => setBillForm({ ...billForm, description: e.target.value })}
              placeholder="Optional description"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBill(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add</Button>
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