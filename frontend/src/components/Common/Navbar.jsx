import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    PointOfSale as BillingIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
                    🏥 SPIS
                </Typography>

                <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                    <Button
                        color="inherit"
                        startIcon={<DashboardIcon />}
                        onClick={() => navigate('/dashboard')}
                        sx={{
                            backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent'
                        }}
                    >
                        Dashboard
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<InventoryIcon />}
                        onClick={() => navigate('/inventory')}
                        sx={{
                            backgroundColor: isActive('/inventory') ? 'rgba(255,255,255,0.2)' : 'transparent'
                        }}
                    >
                        Inventory
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<BillingIcon />}
                        onClick={() => navigate('/billing')}
                        sx={{
                            backgroundColor: isActive('/billing') ? 'rgba(255,255,255,0.2)' : 'transparent'
                        }}
                    >
                        Billing
                    </Button>
                </Box>

                <Button
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
