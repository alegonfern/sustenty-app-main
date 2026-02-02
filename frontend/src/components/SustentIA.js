import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as AIIcon,
  EnergySavingsLeaf as EcoIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import { authService } from '../services/auth';

export default function SustentIA() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy SustentIA, tu asistente de sostenibilidad. Puedo ayudarte con recomendaciones sobre sostenibilidad, análisis de tus datos de la plataforma, y consejos para mejorar el impacto ambiental de tu organización. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Obtener contexto del usuario
      const user = authService.getCurrentUser();
      const organizationsResponse = await api.getOrganizations();
      const organizations = organizationsResponse.data;

      const response = await api.post('/chat/', {
        message: input,
        context: {
          user_id: user?.user_id,
          username: user?.username,
          organizations: organizations.map(org => ({
            name: org.nombre,
            sector: org.sector,
            employees: org.empleados,
            mode: org.modo
          }))
        }
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    '¿Qué puedo hacer para reducir emisiones?',
    'Analiza mis organizaciones',
    'Mejores prácticas de sostenibilidad',
    'Calcula mi huella de carbono'
  ];

  return (
    <>
      {/* Botón flotante */}
      <Fab
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 20 : 32,
          right: isMobile ? 20 : 32,
          bgcolor: 'primary.main',
          color: 'white',
          width: isMobile ? 56 : 64,
          height: isMobile ? 56 : 64,
          zIndex: 1000,
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: 'scale(1.05)',
            boxShadow: '0px 8px 24px rgba(16, 185, 129, 0.4)'
          },
          transition: 'all 0.3s ease',
          boxShadow: '0px 4px 16px rgba(16, 185, 129, 0.3)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
          <EcoIcon sx={{ fontSize: isMobile ? 24 : 28 }} />
          {!isMobile && (
            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, mt: -0.5 }}>
              SustentIA
            </Typography>
          )}
        </Box>
      </Fab>

      {/* Modal del chat */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            height: isMobile ? '100%' : '80vh',
            maxHeight: isMobile ? '100%' : '700px',
            borderRadius: isMobile ? 0 : 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.dark' }}>
              <EcoIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                SustentIA
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Tu asistente de sostenibilidad
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'grey.50'
          }}
        >
          {/* Mensajes */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1
                }}
              >
                {message.role === 'assistant' && (
                  <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                    <AIIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '75%',
                    bgcolor: message.role === 'user' ? 'primary.main' : 'white',
                    color: message.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    boxShadow: 1
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                  <AIIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Preguntas sugeridas */}
          {messages.length === 1 && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Preguntas sugeridas:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedQuestions.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    size="small"
                    onClick={() => setInput(question)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'primary.lighter'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            disabled={loading}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || loading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&.Mui-disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
