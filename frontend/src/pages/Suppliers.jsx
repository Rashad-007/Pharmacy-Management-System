import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Box, Alert, CircularProgress, Grid, InputAdornment
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';

const defaultForm = { name: '', contact_person: '', email: '', phone: '', address: '', city: '', gst_number: '' };

function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editSupplier, setEditSupplier] = useState(null);
    const [formData, setFormData] = useState(defaultForm);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(null);

    useEffect(() => { fetchSuppliers(); }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/suppliers');
            setSuppliers(res.data.data);
        } catch (err) { setError('Failed to load suppliers'); }
        finally { setLoading(false); }
    };

    const handleOpen = (supplier = null) => {
        setEditSupplier(supplier);
        setFormData(supplier ? { ...supplier } : defaultForm);
        setDialogOpen(true);
        setError('');
    };

    const handleSave = async () => {
        try {
            if (editSupplier) {
                await api.put(`/suppliers/${editSupplier.id}`, formData);
                setSuccess('Supplier updated');
            } else {
                await api.post('/suppliers', formData);
                setSuccess('Supplier added');
            }
            setDialogOpen(false);
            fetchSuppliers();
        } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/suppliers/${deleteDialog.id}`);
            setSuccess('Supplier deleted');
            setDeleteDialog(null);
            fetchSuppliers();
        } catch (err) { setError('Failed to delete supplier'); }
    };

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">🏭 Supplier Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add Supplier</Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Paper sx={{ p: 2, mb: 2 }}>
                <TextField fullWidth placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                            {['Supplier Name', 'Contact Person', 'Email', 'Phone', 'City', 'GST Number', 'Actions'].map(h => (
                                <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map(s => (
                            <TableRow key={s.id} hover>
                                <TableCell><strong>{s.name}</strong></TableCell>
                                <TableCell>{s.contact_person || '-'}</TableCell>
                                <TableCell>{s.email || '-'}</TableCell>
                                <TableCell>{s.phone || '-'}</TableCell>
                                <TableCell>{s.city || '-'}</TableCell>
                                <TableCell>{s.gst_number || '-'}</TableCell>
                                <TableCell>
                                    <IconButton size="small" color="primary" onClick={() => handleOpen(s)}><EditIcon /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => setDeleteDialog(s)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filtered.length === 0 && (
                            <TableRow><TableCell colSpan={7} align="center"><Typography color="text.secondary" sx={{ py: 3 }}>No suppliers found. Add your first supplier!</Typography></TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        {[['name', 'Supplier Name *', 12], ['contact_person', 'Contact Person', 6], ['phone', 'Phone', 6], ['email', 'Email', 6], ['city', 'City', 6], ['gst_number', 'GST Number', 6], ['address', 'Address', 12]].map(([key, label, xs]) => (
                            <Grid item xs={xs} key={key}>
                                <TextField fullWidth label={label} value={formData[key] || ''} onChange={e => setFormData({ ...formData, [key]: e.target.value })} multiline={key === 'address'} rows={key === 'address' ? 2 : 1} />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>Delete Supplier</DialogTitle>
                <DialogContent>Are you sure you want to delete <strong>{deleteDialog?.name}</strong>?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Suppliers;
