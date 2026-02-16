import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Navbar from './components/Common/Navbar';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    const isAuthenticated = localStorage.getItem('token');

    const AuthenticatedLayout = ({ children }) => (
        <Box>
            <Navbar />
            {children}
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={isAuthenticated ? <AuthenticatedLayout><Dashboard /></AuthenticatedLayout> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/inventory"
                        element={isAuthenticated ? <AuthenticatedLayout><Inventory /></AuthenticatedLayout> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/billing"
                        element={isAuthenticated ? <AuthenticatedLayout><Billing /></AuthenticatedLayout> : <Navigate to="/login" />}
                    />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
