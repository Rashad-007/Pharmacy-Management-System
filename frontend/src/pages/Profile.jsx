import React, { useState } from 'react';
import {
    Container, Typography, Paper, Box, TextField, Button, Grid,
    Alert, Divider, Avatar, Chip
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import api from '../services/api';

function Profile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [formData, setFormData] = useState({ full_name: user.full_name || '', phone: user.phone || '' });
    const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwError, setPwError] = useState('');

    const handleProfileSave = async () => {
        try {
            await api.put(`/users/${user.id}`, { ...formData, role: user.role });
            const updated = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(updated));
            setSuccess('Profile updated successfully!');
        } catch (err) { setError(err.response?.data?.message || 'Update failed'); }
    };

    const handlePasswordChange = async () => {
        if (passwords.new_password !== passwords.confirm_password) {
            setPwError('Passwords do not match'); return;
        }
        if (passwords.new_password.length < 6) {
            setPwError('Password must be at least 6 characters'); return;
        }
        try {
            await api.patch(`/users/${user.id}/reset-password`, { new_password: passwords.new_password });
            setPwSuccess('Password changed successfully!');
            setPasswords({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) { setPwError(err.response?.data?.message || 'Password change failed'); }
    };

    const roleColor = { admin: 'error', manager: 'warning', pharmacist: 'primary' };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>👤 My Profile</Typography>

            {/* Profile Card */}
            <Paper sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
                        {(user.full_name || user.username || 'U')[0].toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">{user.full_name || user.username}</Typography>
                        <Typography color="text.secondary">{user.email}</Typography>
                        <Chip label={user.role} color={roleColor[user.role] || 'default'} size="small" sx={{ mt: 1 }} />
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="h6" gutterBottom>Edit Profile</Typography>
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Full Name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Email" value={user.email} disabled />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Username" value={user.username} disabled />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" onClick={handleProfileSave}>Save Changes</Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Change Password */}
            <Paper sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>🔑 Change Password</Typography>
                {pwSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPwSuccess('')}>{pwSuccess}</Alert>}
                {pwError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPwError('')}>{pwError}</Alert>}
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="New Password" type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Confirm New Password" type="password" value={passwords.confirm_password} onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" color="warning" onClick={handlePasswordChange}>Change Password</Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}

export default Profile;
