import React from 'react';
import Container from '@mui/material/Container';

export default function ContainerWrapper({ children, sx }) {
  return (
    <Container maxWidth="lg" sx={{ ...sx }}>{children}</Container>
  );
}
