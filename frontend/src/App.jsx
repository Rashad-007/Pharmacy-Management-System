import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Navbar from './components/Common/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Users from './pages/Users';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

const isAuthenticated = () => !!localStorage.getItem('token');

function AuthenticatedLayout({ children, darkMode, onToggleDark }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar darkMode={darkMode} onToggleDark={onToggleDark} />
            <Box component="main" sx={{ flex: 1, bgcolor: 'background.default' }}>
                {children}
            </Box>
        </Box>
    );
}

function ProtectedRoute({ element, darkMode, onToggleDark }) {
    if (!isAuthenticated()) return <Navigate to="/login" />;
    return <AuthenticatedLayout darkMode={darkMode} onToggleDark={onToggleDark}>{element}</AuthenticatedLayout>;
}

function App() {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    const [darkMode, setDarkMode] = useState(savedDark);

    const handleToggleDark = () => {
        const newVal = !darkMode;
        setDarkMode(newVal);
        localStorage.setItem('darkMode', newVal);
    };

    const theme = useMemo(() => createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: { main: '#6366f1' },
            secondary: { main: '#10b981' },
            background: {
                default: darkMode ? '#0f0f1a' : '#f0f2f5',
                paper: darkMode ? '#1e1e2e' : '#ffffff'
            }
        },
        typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
        shape: { borderRadius: 10 },
        components: {
            MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
            MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }
        }
    }), [darkMode]);

    const protectedProps = { darkMode, onToggleDark: handleToggleDark };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/login" element={!isAuthenticated() ? <Login /> : <Navigate to="/dashboard" />} />
                    <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />} />
                    <Route path="/dashboard" element={<ProtectedRoute {...protectedProps} element={<Dashboard />} />} />
                    <Route path="/inventory" element={<ProtectedRoute {...protectedProps} element={<Inventory />} />} />
                    <Route path="/billing" element={<ProtectedRoute {...protectedProps} element={<Billing />} />} />
                    <Route path="/users" element={<ProtectedRoute {...protectedProps} element={<Users />} />} />
                    <Route path="/suppliers" element={<ProtectedRoute {...protectedProps} element={<Suppliers />} />} />
                    <Route path="/reports" element={<ProtectedRoute {...protectedProps} element={<Reports />} />} />
                    <Route path="/profile" element={<ProtectedRoute {...protectedProps} element={<Profile />} />} />
                    <Route path="*" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
