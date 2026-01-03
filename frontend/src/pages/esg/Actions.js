import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper
} from '@mui/material';

const Actions = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Acciones ESG
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Planes de acción y seguimiento de iniciativas ESG
        </Typography>
      </Box>

      <Paper sx={{ p: 3, minHeight: 400 }}>
        <Typography variant="body1" color="text.secondary">
          Esta sección permitirá gestionar y dar seguimiento a las acciones ESG.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Actions;
