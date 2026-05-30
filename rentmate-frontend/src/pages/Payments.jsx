import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Chip, List, ListItem, ListItemText, ListItemIcon, Avatar } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

export default function Payments() {
  const [openPayment, setOpenPayment] = useState(false);
  const [success, setSuccess] = useState('');
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: '', description: '', date: '' });

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setOpenPayment(false);
    setSuccess('Payment added successfully!');
    setPaymentForm({ amount: '', method: '', description: '', date: '' });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'bank transfer': return <AccountBalanceIcon />;
      case 'credit card': return <CreditCardIcon />;
      case 'upi': return <PhoneAndroidIcon />;
      default: return <PaymentIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'pending': return <ScheduleIcon />;
      case 'failed': return <WarningIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const payments = [
    { id: 1, amount: 8000, method: 'Bank Transfer', status: 'completed', date: '2024-01-05', description: 'Rent payment for January', from: 'John Doe' },
    { id: 2, amount: 1200, method: 'UPI', status: 'completed', date: '2024-01-08', description: 'Electricity bill payment', from: 'Jane Smith' },
    { id: 3, amount: 6000, method: 'Credit Card', status: 'pending', date: '2024-01-10', description: 'Rent payment for January', from: 'Mike Johnson' },
    { id: 4, amount: 800, method: 'UPI', status: 'failed', date: '2024-01-12', description: 'Water bill payment', from: 'John Doe' },
  ];

  return (
    <Box sx={{ pt: 10, pb: 6, px: 2, background: 'linear-gradient(120deg, #f5f7fa 60%, #D9F0ED 100%)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h1" sx={{ fontWeight: 900, mb: 2, background: 'linear-gradient(90deg, #1a237e 0%, #3949ab 100%)', color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Payments
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', mb: 3 }}>
          Track all payments, manage transactions, and keep everyone accountable. Never lose track of who paid what.
        </Typography>
        <Button variant="contained" color="primary" size="large" startIcon={<AddCircleOutlineIcon />} onClick={() => setOpenPayment(true)}>
          Add Payment
        </Button>
      </Box>

      {/* Payment Summary Cards */}
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PaymentIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Total Payments</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="primary.main">₹16,000</Typography>
              <Typography variant="body2" color="text.secondary">This month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <CheckCircleIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Completed</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="success.main">₹9,200</Typography>
              <Typography variant="body2" color="text.secondary">2 payments</Typography>
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
              <Typography variant="h4" fontWeight={900} color="warning.main">₹6,000</Typography>
              <Typography variant="body2" color="text.secondary">1 payment</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <WarningIcon color="error" sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6" fontWeight={700}>Failed</Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="error.main">₹800</Typography>
              <Typography variant="body2" color="text.secondary">1 payment</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payments List */}
      <Card sx={{ borderRadius: 4, boxShadow: 3, maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={3}>Recent Payments</Typography>
          <List>
            {payments.map((payment) => (
              <ListItem key={payment.id} sx={{ border: '1px solid #e0e7ef', borderRadius: 2, mb: 2 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getPaymentMethodIcon(payment.method)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" fontWeight={600}>{payment.description}</Typography>
                        <Typography variant="body2" color="text.secondary">From: {payment.from}</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="primary.main">₹{payment.amount}</Typography>
                    </Box>
                  }
                  secondary={
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(payment.date).toLocaleDateString()} • {payment.method}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(payment.status)}
                        label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        color={getStatusColor(payment.status)}
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

      {/* Add Payment Dialog */}
      <Dialog open={openPayment} onClose={() => setOpenPayment(false)}>
        <DialogTitle>Add New Payment</DialogTitle>
        <form onSubmit={handlePaymentSubmit}>
          <DialogContent sx={{ minWidth: 320 }}>
            <TextField 
              label="Amount" 
              type="number" 
              fullWidth 
              required 
              sx={{ mb: 2 }} 
              value={paymentForm.amount} 
              onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            />
            <TextField 
              label="Payment Method" 
              fullWidth 
              required 
              sx={{ mb: 2 }} 
              value={paymentForm.method} 
              onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
              placeholder="Bank Transfer, UPI, Credit Card, etc."
            />
            <TextField 
              label="Description" 
              fullWidth 
              required 
              sx={{ mb: 2 }} 
              value={paymentForm.description} 
              onChange={e => setPaymentForm({ ...paymentForm, description: e.target.value })}
              placeholder="What is this payment for?"
            />
            <TextField 
              label="Payment Date" 
              type="date" 
              fullWidth 
              required 
              sx={{ mb: 2 }} 
              InputLabelProps={{ shrink: true }} 
              value={paymentForm.date} 
              onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPayment(false)}>Cancel</Button>
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