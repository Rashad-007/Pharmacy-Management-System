import React from 'react';
import { Container, Typography } from '@mui/material';

function Billing() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Billing & Sales
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Billing features coming soon...
            </Typography>
        </Container>
    );
}

export default Billing;
