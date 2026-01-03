import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper
} from '@mui/material';

const Analytics = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analítica ESG
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Análisis y visualización de datos ESG
        </Typography>
      </Box>

      <Paper sx={{ p: 3, minHeight: 400 }}>
        <Typography variant="body1" color="text.secondary">
          Esta sección permitirá analizar y visualizar métricas ESG.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Analytics;
