import React from 'react';
import Box from '@mui/material/Box';

export default function GraphicsCard({ children, sx }) {
  return (
    <Box
      sx={{
        boxShadow: '0 4px 24px rgba(21, 177, 157, 0.08)',
        borderRadius: 4,
        bgcolor: '#fff',
        p: 3,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
