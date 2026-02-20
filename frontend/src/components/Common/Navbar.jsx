import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, IconButton,
    Badge, Menu, MenuItem, Tooltip, Divider, ListItemIcon,
    Avatar, Chip
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    Receipt as BillingIcon,
    People as UsersIcon,
    LocalShipping as SupplierIcon,
    Assessment as ReportsIcon,
    Notifications as BellIcon,
    DarkMode as DarkIcon,
    LightMode as LightIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Warning as WarningIcon,
    Schedule as ExpiryIcon,
    LocalPharmacy as PharmacyIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const NAV_LINKS = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Inventory', path: '/inventory', icon: <InventoryIcon fontSize="small" /> },
    { label: 'Billing', path: '/billing', icon: <BillingIcon fontSize="small" /> },
    { label: 'Suppliers', path: '/suppliers', icon: <SupplierIcon fontSize="small" /> },
    { label: 'Reports', path: '/reports', icon: <ReportsIcon fontSize="small" /> },
];

function Navbar({ darkMode, onToggleDark }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [notifAnchor, setNotifAnchor] = useState(null);
    const [profileAnchor, setProfileAnchor] = useState(null);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const [lowRes, expRes] = await Promise.all([
                api.get('/inventory/low-stock'),
                api.get('/inventory/expiring-soon?days=14')
            ]);
            const lowStockAlerts = (lowRes.data.data || []).slice(0, 3).map(m => ({
                type: 'warning',
                message: `${m.name} — only ${m.stock_quantity} left in stock`,
                icon: <WarningIcon fontSize="small" color="warning" />
            }));
            const expiryAlerts = (expRes.data.data || []).slice(0, 3).map(m => ({
                type: 'error',
                message: `${m.name} — expires ${new Date(m.expiry_date).toLocaleDateString()}`,
                icon: <ExpiryIcon fontSize="small" color="error" />
            }));
            setAlerts([...lowStockAlerts, ...expiryAlerts]);
        } catch (err) {
            console.log('Could not fetch alerts');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <AppBar position="sticky" elevation={2} sx={{ bgcolor: darkMode ? '#1e1e2e' : 'primary.main' }}>
            <Toolbar>
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 3 }}>
                    <PharmacyIcon />
                    <Typography variant="h6" fontWeight="bold" sx={{ display: { xs: 'none', sm: 'block' } }}>
                        SPIS
                    </Typography>
                </Box>

                {/* Nav Links */}
                <Box sx={{ display: 'flex', gap: 0.5, flex: 1, flexWrap: 'wrap' }}>
                    {NAV_LINKS.map(link => {
                        const isActive = location.pathname === link.path;
                        if (link.label === 'Users' && user.role !== 'admin') return null;
                        return (
                            <Button
                                key={link.path}
                                startIcon={link.icon}
                                onClick={() => navigate(link.path)}
                                sx={{
                                    color: 'white',
                                    bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                    fontWeight: isActive ? 'bold' : 'normal',
                                    fontSize: '0.8rem',
                                    px: 1.5
                                }}
                            >
                                {link.label}
                            </Button>
                        );
                    })}
                    {/* Users link — admin only */}
                    {user.role === 'admin' && (
                        <Button
                            startIcon={<UsersIcon fontSize="small" />}
                            onClick={() => navigate('/users')}
                            sx={{
                                color: 'white',
                                bgcolor: location.pathname === '/users' ? 'rgba(255,255,255,0.2)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                fontWeight: location.pathname === '/users' ? 'bold' : 'normal',
                                fontSize: '0.8rem', px: 1.5
                            }}
                        >
                            Users
                        </Button>
                    )}
                </Box>

                {/* Right icons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Dark mode toggle */}
                    <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                        <IconButton color="inherit" onClick={onToggleDark}>
                            {darkMode ? <LightIcon /> : <DarkIcon />}
                        </IconButton>
                    </Tooltip>

                    {/* Notifications */}
                    <Tooltip title="Notifications">
                        <IconButton color="inherit" onClick={e => setNotifAnchor(e.currentTarget)}>
                            <Badge badgeContent={alerts.length} color="error">
                                <BellIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)}
                        PaperProps={{ sx: { width: 340, maxHeight: 400 } }}>
                        <MenuItem disabled><Typography variant="subtitle2" fontWeight="bold">Alerts ({alerts.length})</Typography></MenuItem>
                        <Divider />
                        {alerts.length === 0 ? (
                            <MenuItem><Typography variant="body2" color="text.secondary">All clear! No alerts.</Typography></MenuItem>
                        ) : alerts.map((a, i) => (
                            <MenuItem key={i} onClick={() => { navigate('/inventory'); setNotifAnchor(null); }}
                                sx={{ whiteSpace: 'normal', '&:hover': { bgcolor: 'action.hover' } }}>
                                <ListItemIcon>{a.icon}</ListItemIcon>
                                <Typography variant="body2">{a.message}</Typography>
                            </MenuItem>
                        ))}
                        <Divider />
                        <MenuItem onClick={() => { navigate('/inventory'); setNotifAnchor(null); }}>
                            <Typography variant="caption" color="primary">View Inventory →</Typography>
                        </MenuItem>
                    </Menu>

                    {/* Profile */}
                    <Tooltip title="Profile">
                        <IconButton color="inherit" onClick={e => setProfileAnchor(e.currentTarget)}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>
                                {(user.full_name || user.username || 'U')[0].toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)}>
                        <MenuItem disabled>
                            <Box>
                                <Typography variant="body2" fontWeight="bold">{user.full_name || user.username}</Typography>
                                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                <Box><Chip label={user.role} size="small" color="primary" sx={{ mt: 0.5 }} /></Box>
                            </Box>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={() => { navigate('/profile'); setProfileAnchor(null); }}>
                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                            My Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
