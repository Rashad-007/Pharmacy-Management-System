import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Grid, Card, CardContent, CardActionArea, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp as SalesIcon,
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    Schedule as ExpiryIcon
} from '@mui/icons-material';
import api from '../services/api';

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalSales: 0,
        totalMedicines: 0,
        lowStock: 0,
        expiringSoon: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // Fetch all medicines
            const inventoryResponse = await api.get('/inventory');
            const medicines = inventoryResponse.data.data || [];

            // Fetch low stock medicines
            const lowStockResponse = await api.get('/inventory/low-stock');
            const lowStockMedicines = lowStockResponse.data.data || [];

            // Fetch expiring soon medicines (2 weeks = 14 days)
            const expiringResponse = await api.get('/inventory/expiring-soon?days=14');
            const expiringMedicines = expiringResponse.data.data || [];

            // Fetch sales (if available)
            let totalSales = 0;
            try {
                const salesResponse = await api.get('/sales');
                const sales = salesResponse.data.data || [];
                totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
            } catch (err) {
                console.log('Sales data not available');
            }

            setStats({
                totalSales: totalSales.toFixed(2),
                totalMedicines: medicines.length,
                lowStock: lowStockMedicines.length,
                expiringSoon: expiringMedicines.length
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, onClick }) => (
        <Card sx={{ height: '100%' }}>
            <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: `${color}.lighter`,
                            color: `${color}.main`,
                            display: 'flex'
                        }}>
                            {icon}
                        </Box>
                    </Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {title}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Welcome back, {user.full_name || user.username}!
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Sales"
                        value={`₹${stats.totalSales}`}
                        icon={<SalesIcon fontSize="large" />}
                        color="primary"
                        onClick={() => navigate('/billing')}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Inventory Items"
                        value={stats.totalMedicines}
                        icon={<InventoryIcon fontSize="large" />}
                        color="success"
                        onClick={() => navigate('/inventory')}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Low Stock"
                        value={stats.lowStock}
                        icon={<WarningIcon fontSize="large" />}
                        color="error"
                        onClick={() => navigate('/inventory')}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Expiring Soon"
                        value={stats.expiringSoon}
                        icon={<ExpiryIcon fontSize="large" />}
                        color="warning"
                        onClick={() => navigate('/inventory')}
                    />
                </Grid>
            </Grid>

            <Paper sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Typography variant="body2" color="text.secondary">
                    Click on any card above to navigate to that section, or use the navigation menu at the top.
                </Typography>
            </Paper>
        </Container>
    );
}

export default Dashboard;
