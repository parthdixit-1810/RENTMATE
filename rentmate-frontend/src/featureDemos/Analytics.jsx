import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const MONTHLY_DATA = [
  { month: 'Aug', rent: 12000, utilities: 1520, total: 13520 },
  { month: 'Sep', rent: 12000, utilities: 1840, total: 13840 },
  { month: 'Oct', rent: 12000, utilities: 2140, total: 14140 },
  { month: 'Nov', rent: 12000, utilities: 1680, total: 13680 },
  { month: 'Dec', rent: 12000, utilities: 2260, total: 14260 },
  { month: 'Jan', rent: 12000, utilities: 1700, total: 13700 },
];

const CATEGORY_DATA = [
  { name: 'Electricity', value: 900, color: '#ffb300' },
  { name: 'Water', value: 300, color: '#29b6f6' },
  { name: 'Internet', value: 400, color: '#7e57c2' },
  { name: 'Gas', value: 100, color: '#8d6e63' },
];

const fmt = (v) => `₹${(v / 1000).toFixed(1)}k`;
const fmtFull = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #e0e7ef', borderRadius: 2, p: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map(p => (
        <Typography key={p.name} variant="body2" sx={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {fmtFull(p.value)}
        </Typography>
      ))}
    </Box>
  );
};

export default function Analytics() {
  const [chartType, setChartType] = useState('bar');

  const thisMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1].total;
  const prevMonth = MONTHLY_DATA[MONTHLY_DATA.length - 2].total;
  const changePct = ((thisMonth - prevMonth) / prevMonth * 100).toFixed(1);
  const avgMonthly = Math.round(MONTHLY_DATA.reduce((s, m) => s + m.total, 0) / MONTHLY_DATA.length);
  const totalUtilities = CATEGORY_DATA.reduce((s, c) => s + c.value, 0);

  const statCards = [
    { label: 'This Month', value: fmtFull(thisMonth), sub: `${changePct > 0 ? '+' : ''}${changePct}% vs last month`, color: 'primary.main' },
    { label: 'Monthly Average', value: fmtFull(avgMonthly), sub: 'Last 6 months', color: 'text.primary' },
    { label: 'Peak Month', value: fmtFull(Math.max(...MONTHLY_DATA.map(m => m.total))), sub: 'Highest in 6 months', color: 'error.main' },
    { label: 'Utility Share', value: `${Math.round(totalUtilities / thisMonth * 100)}%`, sub: 'Of total expenses', color: 'secondary.main' },
  ];

  return (
    <Box>
      {/* Summary stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map(stat => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, display: 'block', mb: 0.5 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={stat.color} sx={{ mb: 0.25 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">{stat.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Monthly trend */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Monthly Expenses</Typography>
              <Typography variant="caption" color="text.secondary">Rent and utilities over the last 6 months</Typography>
            </Box>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(_, v) => v && setChartType(v)}
              size="small"
            >
              <ToggleButton value="bar" sx={{ textTransform: 'none', px: 2, fontWeight: 600 }}>Bar</ToggleButton>
              <ToggleButton value="line" sx={{ textTransform: 'none', px: 2, fontWeight: 600 }}>Line</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <ResponsiveContainer width="100%" height={260}>
            {chartType === 'bar' ? (
              <BarChart data={MONTHLY_DATA} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 12 }} tickFormatter={fmt} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="rent" name="Rent" fill="#1a237e" radius={[5, 5, 0, 0]} />
                <Bar dataKey="utilities" name="Utilities" fill="#ff6f61" radius={[5, 5, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 12 }} tickFormatter={fmt} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="total" name="Total" stroke="#1a237e" strokeWidth={2.5} dot={{ r: 4, fill: '#1a237e' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="utilities" name="Utilities" stroke="#ff6f61" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Utility Breakdown</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Current month by category
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [fmtFull(value), '']} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
                {CATEGORY_DATA.map(c => (
                  <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                    <Typography variant="caption" fontWeight={500}>{c.name}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Category Details</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
                Share of total utility spend
              </Typography>
              {CATEGORY_DATA.map(c => {
                const pct = Math.round(c.value / totalUtilities * 100);
                return (
                  <Box key={c.name} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={700}>{fmtFull(c.value)}</Typography>
                        <Typography variant="caption" color="text.secondary">({pct}%)</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#f0f4f8' }}>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: c.color, width: `${pct}%`, transition: 'width 0.5s ease' }} />
                    </Box>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
