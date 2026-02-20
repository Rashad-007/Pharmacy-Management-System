import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Paper, Typography, Box, CircularProgress,
    Card, CardContent, CardActionArea, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import {
    TrendingUp, Inventory, Warning, Schedule,
    AttachMoney, LocalPharmacy
} from '@mui/icons-material';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

function StatCard({ title, value, icon, color, subtitle, onClick }) {
    return (
        <Card sx={{ cursor: onClick ? 'pointer' : 'default', bgcolor: color + '10', borderLeft: `4px solid ${color}` }}
            onClick={onClick}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography color="text.secondary" variant="body2">{title}</Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ color }}>{value}</Typography>
                        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
                    </Box>
                    <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
                </Box>
            </CardContent>
        </Card>
    );
}

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [dailySales, setDailySales] = useState([]);
    const [topMedicines, setTopMedicines] = useState([]);
    const [categoryStock, setCategoryStock] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [summaryRes, dailyRes, topRes, catRes, recentRes] = await Promise.all([
                api.get('/analytics/summary'),
                api.get('/analytics/daily-sales'),
                api.get('/analytics/top-medicines'),
                api.get('/analytics/category-stock'),
                api.get('/analytics/recent-sales')
            ]);
            setStats(summaryRes.data.data);
            setDailySales(dailyRes.data.data);
            setTopMedicines(topRes.data.data);
            setCategoryStock(catRes.data.data);
            setRecentSales(recentRes.data.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Box textAlign="center">
                    <CircularProgress size={60} />
                    <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    👋 Welcome back, {user.full_name || user.username || 'Pharmacist'}!
                </Typography>
                <Typography color="text.secondary">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
            </Box>

            {/* Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats?.total_revenue?.toFixed(0) || 0}`}
                        subtitle={`₹${stats?.today_revenue?.toFixed(0) || 0} today`}
                        icon={<AttachMoney fontSize="large" />}
                        color="#10b981"
                        onClick={() => navigate('/billing')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Inventory Items"
                        value={stats?.total_medicines || 0}
                        icon={<Inventory fontSize="large" />}
                        color="#6366f1"
                        onClick={() => navigate('/inventory')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Low Stock"
                        value={stats?.low_stock_count || 0}
                        subtitle="Below reorder level"
                        icon={<Warning fontSize="large" />}
                        color="#ef4444"
                        onClick={() => navigate('/inventory')}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Expiring Soon"
                        value={(stats?.expiring_soon_count || 0) + (stats?.expired_count || 0)}
                        subtitle={`${stats?.expired_count || 0} already expired`}
                        icon={<Schedule fontSize="large" />}
                        color="#f59e0b"
                        onClick={() => navigate('/inventory')}
                    />
                </Grid>
            </Grid>

            {/* Charts Row 1 */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Line Chart - Daily Sales */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>📈 Sales Revenue (Last 7 Days)</Typography>
                        {dailySales.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={dailySales}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(val) => `₹${val.toFixed(2)}`} />
                                    <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Revenue (₹)" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">No sales data yet. Make some sales via Billing!</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Pie Chart - Category Stock */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>🗂️ Stock by Category</Typography>
                        {categoryStock.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={categoryStock} dataKey="medicine_count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                        {categoryStock.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">No inventory data</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Charts Row 2 */}
            <Grid container spacing={3}>
                {/* Bar Chart - Top Medicines */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>💊 Top Selling Medicines</Typography>
                        {topMedicines.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={topMedicines} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="total_sold" fill="#6366f1" name="Units Sold" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">No sales recorded yet</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Recent Sales Table */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>🧾 Recent Sales</Typography>
                        {recentSales.length > 0 ? (
                            <TableContainer sx={{ maxHeight: 220 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Invoice</TableCell>
                                            <TableCell>Customer</TableCell>
                                            <TableCell>Total</TableCell>
                                            <TableCell>Payment</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentSales.map(sale => (
                                            <TableRow key={sale.id} hover>
                                                <TableCell><Typography variant="caption" fontFamily="monospace">{sale.invoice_number}</Typography></TableCell>
                                                <TableCell>{sale.customer_name || 'Walk-in'}</TableCell>
                                                <TableCell><strong>₹{parseFloat(sale.total_amount).toFixed(0)}</strong></TableCell>
                                                <TableCell>
                                                    <Chip label={sale.payment_method} size="small" color="primary" variant="outlined" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">No recent sales</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Dashboard;
