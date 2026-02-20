import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Chip, Box, Alert, CircularProgress, Grid, MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Block as BlockIcon, CheckCircle as ActiveIcon } from '@mui/icons-material';
import api from '../services/api';

const ROLES = ['admin', 'manager', 'pharmacist'];
const defaultForm = { username: '', full_name: '', email: '', password: '', phone: '', role: 'pharmacist' };

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [formData, setFormData] = useState(defaultForm);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally { setLoading(false); }
    };

    const handleOpen = (user = null) => {
        setEditUser(user);
        setFormData(user ? { ...user, password: '' } : defaultForm);
        setDialogOpen(true);
        setError('');
    };

    const handleSave = async () => {
        try {
            if (editUser) {
                await api.put(`/users/${editUser.id}`, formData);
                setSuccess('User updated successfully');
            } else {
                await api.post('/users', formData);
                setSuccess('User created successfully');
            }
            setDialogOpen(false);
            fetchUsers();
        } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
    };

    const toggleStatus = async (user) => {
        try {
            await api.patch(`/users/${user.id}/toggle-status`);
            setSuccess(`User ${user.is_active ? 'deactivated' : 'activated'}`);
            fetchUsers();
        } catch (err) { setError('Failed to update user status'); }
    };

    if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">👥 User Management</Typography>
                {currentUser.role === 'admin' && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Add User</Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                            {['Name', 'Username', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => (
                                <TableCell key={h} sx={{ color: 'white', fontWeight: 'bold' }}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id} hover>
                                <TableCell>{user.full_name || '-'}</TableCell>
                                <TableCell><strong>{user.username}</strong></TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone || '-'}</TableCell>
                                <TableCell>
                                    <Chip label={user.role} size="small"
                                        color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'default'} />
                                </TableCell>
                                <TableCell>
                                    <Chip label={user.is_active ? 'Active' : 'Inactive'} size="small"
                                        color={user.is_active ? 'success' : 'error'} />
                                </TableCell>
                                <TableCell>
                                    {currentUser.role === 'admin' && (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton size="small" color="primary" onClick={() => handleOpen(user)}><EditIcon /></IconButton>
                                            <IconButton size="small" color={user.is_active ? 'error' : 'success'} onClick={() => toggleStatus(user)}>
                                                {user.is_active ? <BlockIcon /> : <ActiveIcon />}
                                            </IconButton>
                                        </Box>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Full Name" value={formData.full_name || ''} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Username *" value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value })} disabled={!!editUser} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Email *" type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </Grid>
                        {!editUser && (
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Password *" type="password" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth select label="Role" value={formData.role || 'pharmacist'} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                {ROLES.map(r => <MenuItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</MenuItem>)}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Users;
