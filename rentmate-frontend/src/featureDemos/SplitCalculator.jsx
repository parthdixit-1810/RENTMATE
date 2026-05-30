import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Divider, InputAdornment, Chip, ToggleButton,
  ToggleButtonGroup, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const DEFAULT_PEOPLE = [
  { id: 1, name: 'You', percentage: null },
  { id: 2, name: 'Roommate 1', percentage: null },
];

export default function SplitCalculator() {
  const [totalAmount, setTotalAmount] = useState('');
  const [splitMethod, setSplitMethod] = useState('equal');
  const [people, setPeople] = useState(DEFAULT_PEOPLE);
  const [copied, setCopied] = useState(false);

  const addPerson = () => {
    setPeople(prev => [...prev, { id: Date.now(), name: `Roommate ${prev.length}`, percentage: null }]);
  };

  const removePerson = (id) => {
    if (people.length <= 2) return;
    setPeople(prev => prev.filter(p => p.id !== id));
  };

  const updateName = (id, name) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const updatePercentage = (id, val) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, percentage: val === '' ? null : Number(val) } : p));
  };

  const total = parseFloat(totalAmount) || 0;
  const n = people.length;

  const getShare = (person) => {
    if (!total) return 0;
    if (splitMethod === 'equal') return total / n;
    const pct = person.percentage ?? (100 / n);
    return (pct / 100) * total;
  };

  const totalPct = people.reduce((sum, p) => sum + (p.percentage ?? (100 / n)), 0);
  const pctValid = Math.abs(totalPct - 100) < 0.01;

  const handleCopy = () => {
    const rows = people.map(p => `${p.name}: ₹${getShare(p).toFixed(2)}`).join('\n');
    navigator.clipboard.writeText(`Total: ₹${total.toFixed(2)}\n${rows}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ flexShrink: 0 }}>
            <rect width="56" height="56" rx="14" fill="#e8eaf6" />
            <path d="M14 40h28M20 40V26l8-7 8 7v14" stroke="#1a237e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="24" y="30" width="8" height="10" rx="1" stroke="#3949ab" strokeWidth="2" />
            <path d="M37 17h5v5" stroke="#ff6f61" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M42 17l-5 5" stroke="#ff6f61" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <Box>
            <Typography variant="h6" fontWeight={700}>Split Calculator</Typography>
            <Typography variant="body2" color="text.secondary">
              Calculate how to divide rent or any bill among roommates.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
          <TextField
            label="Total Amount"
            type="number"
            value={totalAmount}
            onChange={e => setTotalAmount(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            inputProps={{ min: 0, step: 1 }}
            size="small"
          />
          <ToggleButtonGroup
            value={splitMethod}
            exclusive
            onChange={(_, v) => v && setSplitMethod(v)}
            fullWidth
            size="small"
          >
            <ToggleButton value="equal" sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}>
              Equal Split
            </ToggleButton>
            <ToggleButton value="custom" sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}>
              Custom %
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ mb: 1 }}>
          {people.map((person, idx) => (
            <Box key={person.id} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
              <TextField
                label={`Person ${idx + 1}`}
                value={person.name}
                onChange={e => updateName(person.id, e.target.value)}
                size="small"
                sx={{ flex: 2 }}
              />
              {splitMethod === 'custom' && (
                <TextField
                  label="%"
                  type="number"
                  value={person.percentage ?? ''}
                  onChange={e => updatePercentage(person.id, e.target.value)}
                  size="small"
                  sx={{ flex: 1, minWidth: 90 }}
                  inputProps={{ min: 0, max: 100, step: 0.5 }}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                />
              )}
              <Box sx={{ minWidth: 90, textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  ₹{getShare(person).toFixed(2)}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => removePerson(person.id)}
                disabled={people.length <= 2}
                color="error"
                sx={{ opacity: people.length <= 2 ? 0.3 : 1 }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>

        {splitMethod === 'custom' && !pctValid && !!totalAmount && (
          <Alert severity="warning" sx={{ mb: 1.5, py: 0.5 }}>
            Percentages must add up to 100%. Currently: {totalPct.toFixed(1)}%
          </Alert>
        )}

        <Button
          startIcon={<AddIcon />}
          onClick={addPerson}
          size="small"
          variant="outlined"
          sx={{ mb: 3, textTransform: 'none' }}
        >
          Add Person
        </Button>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Total: ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            disabled={!total}
            sx={{ textTransform: 'none' }}
          >
            {copied ? 'Copied!' : 'Copy Summary'}
          </Button>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid #e0e7ef' } }}>
              <TableCell>Name</TableCell>
              {splitMethod === 'custom' && <TableCell>Share</TableCell>}
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {people.map(person => (
              <TableRow key={person.id} sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{person.name}</Typography>
                </TableCell>
                {splitMethod === 'custom' && (
                  <TableCell>
                    <Chip
                      label={`${(person.percentage ?? (100 / n)).toFixed(1)}%`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                )}
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    ₹{getShare(person).toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
