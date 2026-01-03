import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper
} from '@mui/material';

const Collection = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Colección ESG
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestión de datos ESG (Ambiental, Social y Gobernanza)
        </Typography>
      </Box>

      <Paper sx={{ p: 3, minHeight: 400 }}>
        <Typography variant="body1" color="text.secondary">
          Esta sección permitirá recopilar y gestionar datos ESG.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Collection;
