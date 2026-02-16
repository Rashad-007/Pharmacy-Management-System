import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Chip, Box, Alert, CircularProgress,
    InputAdornment, Grid, MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import api from '../services/api';

function Inventory() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        generic_name: '',
        category: '',
        manufacturer: '',
        unit_price: '',
        stock_quantity: '',
        reorder_level: '',
        expiry_date: '',
        batch_number: ''
    });

    // Fetch medicines on component mount
    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const response = await api.get('/inventory');
            setMedicines(response.data.data || []);
            setError('');
        } catch (err) {
            setError('Failed to load medicines');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (medicine = null) => {
        if (medicine) {
            setEditingMedicine(medicine);
            setFormData({
                name: medicine.name,
                generic_name: medicine.generic_name || '',
                category: medicine.category || '',
                manufacturer: medicine.manufacturer || '',
                unit_price: medicine.unit_price,
                stock_quantity: medicine.stock_quantity,
                reorder_level: medicine.reorder_level,
                expiry_date: medicine.expiry_date ? medicine.expiry_date.split('T')[0] : '',
                batch_number: medicine.batch_number || ''
            });
        } else {
            setEditingMedicine(null);
            setFormData({
                name: '',
                generic_name: '',
                category: '',
                manufacturer: '',
                unit_price: '',
                stock_quantity: '',
                reorder_level: '',
                expiry_date: '',
                batch_number: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingMedicine(null);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingMedicine) {
                await api.put(`/inventory/${editingMedicine.id}`, formData);
            } else {
                await api.post('/inventory', formData);
            }
            fetchMedicines();
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save medicine');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            try {
                await api.delete(`/inventory/${id}`);
                fetchMedicines();
            } catch (err) {
                setError('Failed to delete medicine');
            }
        }
    };

    const filteredMedicines = medicines.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.generic_name && med.generic_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const isLowStock = (medicine) => medicine.stock_quantity <= medicine.reorder_level;

    // Check if medicine is expired
    const isExpired = (medicine) => {
        if (!medicine.expiry_date) return false;
        const expiryDate = new Date(medicine.expiry_date);
        const today = new Date();
        return expiryDate < today;
    };

    // Check if medicine is expiring soon (within 14 days)
    const isExpiringSoon = (medicine) => {
        if (!medicine.expiry_date) return false;
        const expiryDate = new Date(medicine.expiry_date);
        const today = new Date();
        const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry >= 0 && daysUntilExpiry <= 14;
    };

    // Get expiry status for display
    const getExpiryStatus = (medicine) => {
        if (isExpired(medicine)) return { label: 'Expired', color: 'error' };
        if (isExpiringSoon(medicine)) return { label: 'Expiring Soon', color: 'warning' };
        return null;
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Inventory Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Medicine
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search medicines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Stock</strong></TableCell>
                            <TableCell><strong>Price</strong></TableCell>
                            <TableCell><strong>Expiry Date</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMedicines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary" sx={{ py: 3 }}>
                                        No medicines found. Click "Add Medicine" to get started.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMedicines.map((medicine) => (
                                <TableRow key={medicine.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {medicine.name}
                                        </Typography>
                                        {medicine.generic_name && (
                                            <Typography variant="caption" color="text.secondary">
                                                {medicine.generic_name}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{medicine.category || '-'}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {medicine.stock_quantity}
                                            {isLowStock(medicine) && (
                                                <WarningIcon color="error" fontSize="small" />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>₹{medicine.unit_price}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {medicine.expiry_date
                                                ? new Date(medicine.expiry_date).toLocaleDateString()
                                                : '-'}
                                            {isExpired(medicine) && (
                                                <WarningIcon color="error" fontSize="small" titleAccess="Expired!" />
                                            )}
                                            {isExpiringSoon(medicine) && !isExpired(medicine) && (
                                                <WarningIcon color="warning" fontSize="small" titleAccess="Expiring Soon!" />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {isExpired(medicine) && (
                                                <Chip label="Expired" color="error" size="small" />
                                            )}
                                            {isExpiringSoon(medicine) && !isExpired(medicine) && (
                                                <Chip label="Expiring Soon" color="warning" size="small" />
                                            )}
                                            {isLowStock(medicine) && (
                                                <Chip label="Low Stock" color="error" size="small" />
                                            )}
                                            {!isLowStock(medicine) && !isExpired(medicine) && !isExpiringSoon(medicine) && (
                                                <Chip label="In Stock" color="success" size="small" />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(medicine)}
                                            color="primary"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(medicine.id)}
                                            color="error"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Medicine Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Generic Name"
                                name="generic_name"
                                value={formData.generic_name}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                            >
                                <MenuItem value="">Select Category</MenuItem>
                                <MenuItem value="Analgesics">Analgesics (Pain Relief)</MenuItem>
                                <MenuItem value="Antibiotics">Antibiotics</MenuItem>
                                <MenuItem value="Antihistamines">Antihistamines (Allergy)</MenuItem>
                                <MenuItem value="Antidiabetic">Antidiabetic</MenuItem>
                                <MenuItem value="Antacids">Antacids</MenuItem>
                                <MenuItem value="Antipyretics">Antipyretics (Fever)</MenuItem>
                                <MenuItem value="Antihypertensives">Antihypertensives (Blood Pressure)</MenuItem>
                                <MenuItem value="Vitamins">Vitamins & Supplements</MenuItem>
                                <MenuItem value="Antiseptics">Antiseptics</MenuItem>
                                <MenuItem value="Cardiovascular">Cardiovascular</MenuItem>
                                <MenuItem value="Respiratory">Respiratory</MenuItem>
                                <MenuItem value="Dermatology">Dermatology (Skin)</MenuItem>
                                <MenuItem value="Gastrointestinal">Gastrointestinal</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Manufacturer"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Unit Price (₹)"
                                name="unit_price"
                                type="number"
                                value={formData.unit_price}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Stock Quantity"
                                name="stock_quantity"
                                type="number"
                                value={formData.stock_quantity}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Reorder Level"
                                name="reorder_level"
                                type="number"
                                value={formData.reorder_level}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Expiry Date"
                                name="expiry_date"
                                type="date"
                                value={formData.expiry_date}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Batch Number"
                                name="batch_number"
                                value={formData.batch_number}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingMedicine ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Inventory;
