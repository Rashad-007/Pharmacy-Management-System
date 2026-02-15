import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Welcome back, {user.full_name || user.username}!
            </Typography>

            <Box sx={{ mt: 4, display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" color="primary">Total Sales</Typography>
                    <Typography variant="h4">₹0</Typography>
                    <Typography variant="caption" color="text.secondary">This month</Typography>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" color="primary">Inventory Items</Typography>
                    <Typography variant="h4">0</Typography>
                    <Typography variant="caption" color="text.secondary">Total medicines</Typography>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" color="error">Low Stock</Typography>
                    <Typography variant="h4">0</Typography>
                    <Typography variant="caption" color="text.secondary">Items need reorder</Typography>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" color="warning.main">Expiring Soon</Typography>
                    <Typography variant="h4">0</Typography>
                    <Typography variant="caption" color="text.secondary">Next 30 days</Typography>
                </Paper>
            </Box>

            <Paper sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Typography variant="body2" color="text.secondary">
                    Navigate to Inventory or Billing to get started.
                </Typography>
            </Paper>
        </Container>
    );
}

export default Dashboard;
