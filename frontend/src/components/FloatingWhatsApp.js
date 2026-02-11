import React, { useState } from 'react';
import { Fab, Tooltip, IconButton } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloseIcon from '@mui/icons-material/Close';

export default function FloatingWhatsApp({ phoneNumber = '56912345678', message = 'Hola Sustenty, necesito ayuda con...' }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Tooltip title="Chatea con nosotros" placement="right">
      <Fab
        color="success"
        aria-label="whatsapp"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 1000,
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.7)',
            },
            '70%': {
              boxShadow: '0 0 0 10px rgba(37, 211, 102, 0)',
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(37, 211, 102, 0)',
            },
          },
          '&:hover': {
            animation: 'none',
            transform: 'scale(1.1)',
            transition: 'transform 0.2s',
          }
        }}
      >
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            bgcolor: 'error.main',
            color: 'white',
            width: 24,
            height: 24,
            '&:hover': {
              bgcolor: 'error.dark',
            },
            boxShadow: 2,
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <WhatsAppIcon sx={{ fontSize: 32 }} />
      </Fab>
    </Tooltip>
  );
}
