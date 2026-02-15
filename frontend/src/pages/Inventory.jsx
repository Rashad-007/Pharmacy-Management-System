import React from 'react';
import { Container, Typography } from '@mui/material';

function Inventory() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Inventory Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Inventory features coming soon...
            </Typography>
        </Container>
    );
}

export default Inventory;
