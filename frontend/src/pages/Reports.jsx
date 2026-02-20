import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, TextField,
    Box, Alert, CircularProgress, Grid, MenuItem, Divider, Chip
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import api from '../services/api';

function Reports() {
    const [tab, setTab] = useState('sales');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [sales, setSales] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [salesRes, lowStockRes, expiringRes] = await Promise.all([
                api.get(`/sales?startDate=${startDate}&endDate=${endDate}`),
                api.get('/inventory/low-stock'),
                api.get('/inventory/expiring-soon?days=30')
            ]);
            setSales(salesRes.data.data || []);
            setLowStock(lowStockRes.data.data || []);
            setExpiring(expiringRes.data.data || []);
        } catch (err) { setError('Failed to load report data'); }
        finally { setLoading(false); }
    };

    const exportCSV = (data, filename) => {
        if (!data.length) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).map(v => `"${v ?? ''}"`).join(','));
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);

    const TABS = [
        { key: 'sales', label: `Sales Report (${sales.length})` },
        { key: 'lowstock', label: `Low Stock (${lowStock.length})` },
        { key: 'expiring', label: `Expiring (${expiring.length})` }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>📊 Reports</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Date filter */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item><TextField label="From Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" /></Grid>
                    <Grid item><TextField label="To Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} size="small" /></Grid>
                    <Grid item><Button variant="contained" onClick={fetchAll}>Apply Filter</Button></Grid>
                </Grid>
            </Paper>

            {/* Tab buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                {TABS.map(t => (
                    <Button key={t.key} variant={tab === t.key ? 'contained' : 'outlined'} onClick={() => setTab(t.key)}>{t.label}</Button>
                ))}
            </Box>

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
                <>
                    {/* Sales Report */}
                    {tab === 'sales' && (
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box>
                                    <Typography variant="h6">Sales Report</Typography>
                                    <Typography color="text.secondary">Total Revenue: <strong>₹{totalRevenue.toFixed(2)}</strong> | {sales.length} transactions</Typography>
                                </Box>
                                <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => exportCSV(sales, 'sales_report.csv')}>Export CSV</Button>
                            </Box>
                            <TableContainer sx={{ maxHeight: 450 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            {['Invoice #', 'Customer', 'Phone', 'Subtotal', 'Tax', 'Discount', 'Total', 'Payment', 'Date'].map(h => (
                                                <TableCell key={h}><strong>{h}</strong></TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sales.length === 0 ? (
                                            <TableRow><TableCell colSpan={9} align="center"><Typography color="text.secondary" sx={{ py: 3 }}>No sales in this date range</Typography></TableCell></TableRow>
                                        ) : sales.map(s => (
                                            <TableRow key={s.id} hover>
                                                <TableCell><Typography variant="caption" fontFamily="monospace">{s.invoice_number}</Typography></TableCell>
                                                <TableCell>{s.customer_name || 'Walk-in'}</TableCell>
                                                <TableCell>{s.customer_phone || '-'}</TableCell>
                                                <TableCell>₹{parseFloat(s.subtotal).toFixed(2)}</TableCell>
                                                <TableCell>₹{parseFloat(s.tax_amount).toFixed(2)}</TableCell>
                                                <TableCell>₹{parseFloat(s.discount_amount || 0).toFixed(2)}</TableCell>
                                                <TableCell><strong>₹{parseFloat(s.total_amount).toFixed(2)}</strong></TableCell>
                                                <TableCell><Chip label={s.payment_method} size="small" /></TableCell>
                                                <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* Low Stock Report */}
                    {tab === 'lowstock' && (
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Low Stock Report ({lowStock.length} medicines)</Typography>
                                <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => exportCSV(lowStock, 'low_stock_report.csv')}>Export CSV</Button>
                            </Box>
                            <TableContainer sx={{ maxHeight: 450 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            {['Medicine', 'Category', 'Current Stock', 'Reorder Level', 'Shortage'].map(h => (
                                                <TableCell key={h}><strong>{h}</strong></TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {lowStock.map(m => (
                                            <TableRow key={m.id} hover sx={{ bgcolor: m.stock_quantity === 0 ? 'error.light' : 'warning.light' }}>
                                                <TableCell><strong>{m.name}</strong><br /><Typography variant="caption">{m.generic_name}</Typography></TableCell>
                                                <TableCell>{m.category || '-'}</TableCell>
                                                <TableCell><Chip label={m.stock_quantity === 0 ? 'Out of Stock' : m.stock_quantity} color="error" size="small" /></TableCell>
                                                <TableCell>{m.reorder_level}</TableCell>
                                                <TableCell>{Math.max(0, m.reorder_level - m.stock_quantity)} units needed</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* Expiry Report */}
                    {tab === 'expiring' && (
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Expiring Soon Report (next 30 days)</Typography>
                                <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => exportCSV(expiring, 'expiry_report.csv')}>Export CSV</Button>
                            </Box>
                            <TableContainer sx={{ maxHeight: 450 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            {['Medicine', 'Category', 'Stock', 'Expiry Date', 'Days Left'].map(h => (
                                                <TableCell key={h}><strong>{h}</strong></TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {expiring.map(m => {
                                            const days = Math.floor((new Date(m.expiry_date) - new Date()) / 86400000);
                                            return (
                                                <TableRow key={m.id} hover sx={{ bgcolor: days < 0 ? 'error.light' : days <= 14 ? 'warning.light' : 'inherit' }}>
                                                    <TableCell><strong>{m.name}</strong></TableCell>
                                                    <TableCell>{m.category || '-'}</TableCell>
                                                    <TableCell>{m.stock_quantity}</TableCell>
                                                    <TableCell>{new Date(m.expiry_date).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Chip label={days < 0 ? 'EXPIRED' : `${days} days`} color={days < 0 ? 'error' : days <= 7 ? 'warning' : 'default'} size="small" />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </>
            )}
        </Container>
    );
}

export default Reports;
