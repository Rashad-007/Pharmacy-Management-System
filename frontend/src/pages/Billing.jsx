import React, { useState, useEffect } from 'react';
import {
    Container, Grid, Paper, Typography, TextField, Button, Box,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Divider, Alert, CircularProgress, Chip,
    InputAdornment, MenuItem, Autocomplete
} from '@mui/material';
import {
    Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon,
    Search as SearchIcon, Receipt as ReceiptIcon, ShoppingCart as CartIcon
} from '@mui/icons-material';
import api from '../services/api';

function Billing() {
    const [medicines, setMedicines] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [lastInvoice, setLastInvoice] = useState(null);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const response = await api.get('/inventory');
            setMedicines(response.data.data || []);
        } catch (err) {
            setError('Failed to load medicines');
        }
    };

    const addToCart = (medicine) => {
        if (medicine.stock_quantity <= 0) {
            setError(`${medicine.name} is out of stock`);
            return;
        }
        const existing = cart.find(item => item.medicine_id === medicine.id);
        if (existing) {
            if (existing.quantity >= medicine.stock_quantity) {
                setError(`Only ${medicine.stock_quantity} units available`);
                return;
            }
            setCart(cart.map(item =>
                item.medicine_id === medicine.id
                    ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
                    : item
            ));
        } else {
            setCart([...cart, {
                medicine_id: medicine.id,
                name: medicine.name,
                unit_price: parseFloat(medicine.unit_price),
                quantity: 1,
                subtotal: parseFloat(medicine.unit_price),
                max_stock: medicine.stock_quantity
            }]);
        }
        setError('');
    };

    const updateQuantity = (medicine_id, delta) => {
        setCart(cart.map(item => {
            if (item.medicine_id === medicine_id) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return null;
                if (newQty > item.max_stock) {
                    setError(`Only ${item.max_stock} units available`);
                    return item;
                }
                return { ...item, quantity: newQty, subtotal: newQty * item.unit_price };
            }
            return item;
        }).filter(Boolean));
    };

    const removeFromCart = (medicine_id) => {
        setCart(cart.filter(item => item.medicine_id !== medicine_id));
    };

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax - parseFloat(discount || 0);

    const handleCheckout = async () => {
        if (cart.length === 0) { setError('Cart is empty'); return; }
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/sales', {
                customer_name: customerName,
                customer_phone: customerPhone,
                items: cart.map(item => ({ medicine_id: item.medicine_id, quantity: item.quantity })),
                payment_method: paymentMethod,
                discount_amount: parseFloat(discount || 0)
            });
            setLastInvoice({
                invoice_number: response.data.data.invoice_number,
                total_amount: response.data.data.total_amount,
                customer_name: customerName,
                items: [...cart]
            });
            setSuccessMsg(`Sale completed! Invoice: ${response.data.data.invoice_number}`);
            setCart([]);
            setCustomerName('');
            setCustomerPhone('');
            setDiscount(0);
            fetchMedicines();
        } catch (err) {
            setError(err.response?.data?.message || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!lastInvoice) return;
        const printContent = `
      <html><head><title>Invoice - ${lastInvoice.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        .total { font-weight: bold; font-size: 1.2em; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
      </style></head><body>
      <h2>🏥 Smart Pharmacy Intelligence System</h2>
      <p><strong>Invoice #:</strong> ${lastInvoice.invoice_number}</p>
      <p><strong>Customer:</strong> ${lastInvoice.customer_name || 'Walk-in Customer'}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      <table>
        <tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${lastInvoice.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.unit_price.toFixed(2)}</td><td>₹${i.subtotal.toFixed(2)}</td></tr>`).join('')}
      </table>
      <p class="total" style="text-align:right">Total Paid: ₹${parseFloat(lastInvoice.total_amount).toFixed(2)}</p>
      <p class="footer">Thank you for your visit!</p>
      </body></html>`;
        const w = window.open('', '_blank');
        w.document.write(printContent);
        w.document.close();
        w.print();
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.generic_name && m.generic_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                💊 Billing / Point of Sale
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {successMsg && (
                <Alert severity="success" sx={{ mb: 2 }} action={
                    lastInvoice && <Button size="small" onClick={handlePrint}>🖨️ Print Invoice</Button>
                } onClose={() => setSuccessMsg('')}>{successMsg}</Alert>
            )}

            <Grid container spacing={3}>
                {/* Left: Medicine Search */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="Search medicines by name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                            }}
                        />
                    </Paper>

                    <Paper sx={{ p: 0, maxHeight: 420, overflow: 'auto' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Medicine</strong></TableCell>
                                    <TableCell><strong>Stock</strong></TableCell>
                                    <TableCell><strong>Price</strong></TableCell>
                                    <TableCell align="center"><strong>Add</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredMedicines.map(med => (
                                    <TableRow key={med.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">{med.name}</Typography>
                                            {med.generic_name && <Typography variant="caption" color="text.secondary">{med.generic_name}</Typography>}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={med.stock_quantity}
                                                size="small"
                                                color={med.stock_quantity === 0 ? 'error' : med.stock_quantity <= med.reorder_level ? 'warning' : 'success'}
                                            />
                                        </TableCell>
                                        <TableCell>₹{parseFloat(med.unit_price).toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => addToCart(med)}
                                                disabled={med.stock_quantity === 0}
                                            >
                                                <AddIcon fontSize="small" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                {/* Right: Cart & Checkout */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            <CartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Cart ({cart.length} items)
                        </Typography>

                        {cart.length === 0 ? (
                            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                                Add medicines from the list
                            </Typography>
                        ) : (
                            <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
                                {cart.map(item => (
                                    <Box key={item.medicine_id} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" fontWeight="medium">{item.name}</Typography>
                                            <Typography variant="caption">₹{item.unit_price.toFixed(2)} × {item.quantity} = ₹{item.subtotal.toFixed(2)}</Typography>
                                        </Box>
                                        <IconButton size="small" onClick={() => updateQuantity(item.medicine_id, -1)}><RemoveIcon fontSize="small" /></IconButton>
                                        <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                                        <IconButton size="small" onClick={() => updateQuantity(item.medicine_id, 1)}><AddIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => removeFromCart(item.medicine_id)}><DeleteIcon fontSize="small" /></IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        {/* Customer Info */}
                        <TextField fullWidth label="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} size="small" sx={{ mb: 1 }} />
                        <TextField fullWidth label="Customer Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} size="small" sx={{ mb: 1 }} />
                        <TextField select fullWidth label="Payment Method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} size="small" sx={{ mb: 1 }}>
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="card">Card</MenuItem>
                            <MenuItem value="upi">UPI</MenuItem>
                        </TextField>
                        <TextField fullWidth label="Discount (₹)" type="number" value={discount} onChange={e => setDiscount(e.target.value)} size="small" sx={{ mb: 2 }} />

                        <Divider sx={{ mb: 2 }} />

                        {/* Totals */}
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">Subtotal:</Typography>
                                <Typography variant="body2">₹{subtotal.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">GST (18%):</Typography>
                                <Typography variant="body2">₹{tax.toFixed(2)}</Typography>
                            </Box>
                            {discount > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" color="success.main">Discount:</Typography>
                                    <Typography variant="body2" color="success.main">-₹{parseFloat(discount).toFixed(2)}</Typography>
                                </Box>
                            )}
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" fontWeight="bold">Total:</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">₹{total.toFixed(2)}</Typography>
                            </Box>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} /> : <ReceiptIcon />}
                            onClick={handleCheckout}
                            disabled={loading || cart.length === 0}
                        >
                            {loading ? 'Processing...' : 'Complete Sale'}
                        </Button>

                        {lastInvoice && (
                            <Button fullWidth variant="outlined" sx={{ mt: 1 }} onClick={handlePrint}>
                                🖨️ Print Last Invoice
                            </Button>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Billing;
