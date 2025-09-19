import { Container, Paper, Typography } from '@mui/material';
import { useSummary } from '../api/hooks';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
  const { data } = useSummary('15151') as any;

  const chartData = (data || []).map((d: any) => ({
    period: new Date(d.periodStart).toISOString().slice(0,7),
    revenue: d.revenue,
    cogs: d.cogs,
    opex: d.opex,
    netIncome: d.netIncome
  }));

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Dashboard</Typography>
      <Paper sx={{ p: 2, height: 360, mb: 3 }}>
        <Typography>Net Income Over Time</Typography>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="netIncome" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      <Paper sx={{ p: 2, height: 360 }}>
        <Typography>Revenue vs Expenses</Typography>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" />
            <Bar dataKey="opex" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Container>
  );
}
