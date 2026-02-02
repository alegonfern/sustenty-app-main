import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
  Link as MuiLink
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Code as CodeIcon,
  EnergySavingsLeaf as EcoIcon,
  Rocket as RocketIcon,
  People as PeopleIcon,
  QuestionAnswer as QuestionAnswerIcon,
  MenuBook as MenuBookIcon,
  TrendingUp as TrendingUpIcon,
  Send as SendIcon,
  WhatsApp as WhatsAppIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import { toast } from 'react-toastify';

export default function Help() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await api.post('/contact/', contactForm);
      toast.success('¡Mensaje enviado! Te responderemos pronto.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje. Intenta por WhatsApp.');
    } finally {
      setSending(false);
    }
  };

  const faqs = [
    {
      category: 'Primeros Pasos',
      icon: <RocketIcon />,
      questions: [
        {
          q: '¿Cómo empiezo a usar Sustenty?',
          a: 'Después de crear tu cuenta, el primer paso es crear tu organización. Luego, configura tu contexto ESG (industria, tamaño, objetivos) y comienza a registrar tus emisiones o sube tus primeros documentos para análisis de cumplimiento.'
        },
        {
          q: '¿Qué información necesito tener preparada?',
          a: 'Para comenzar necesitas: datos básicos de tu empresa (RUT, sector, número de empleados), facturas de servicios (electricidad, gas, combustibles) si quieres calcular emisiones, y documentos de cumplimiento normativo si deseas analizar brechas regulatorias.'
        },
        {
          q: '¿Cuánto tiempo toma la configuración inicial?',
          a: 'La configuración básica toma 5-10 minutos. Sin embargo, recomendamos dedicar tu primera sesión (30-45 min) a explorar las diferentes funcionalidades y cargar tus primeros datos para obtener insights inmediatos.'
        }
      ]
    },
    {
      category: 'Emisiones y Datos ESG',
      icon: <EcoIcon />,
      questions: [
        {
          q: '¿Qué tipos de emisiones puedo registrar?',
          a: 'Puedes registrar emisiones de Alcance 1 (directas), Alcance 2 (electricidad) y Alcance 3 (indirectas). El sistema calcula automáticamente tCO2e usando factores de emisión actualizados según tu país y sector.'
        },
        {
          q: '¿Cómo funciona el cálculo automático de emisiones?',
          a: 'Subes tus facturas o datos de consumo (kWh, litros, km recorridos, etc.) y nuestra IA extrae la información relevante. Luego aplicamos factores de emisión oficiales (IPCC, EPA, Ministerios locales) para calcular tu huella de carbono.'
        },
        {
          q: '¿Puedo importar datos de otras plataformas?',
          a: 'Sí, actualmente soportamos importación desde Excel/CSV y estamos trabajando en integraciones con Google Sheets, Salesforce y otras plataformas. Contáctanos si necesitas una integración específica.'
        }
      ]
    },
    {
      category: 'Cumplimiento Normativo',
      icon: <AssessmentIcon />,
      questions: [
        {
          q: '¿Qué regulaciones ESG cubre Sustenty?',
          a: 'Cubrimos las principales normativas: CSRD (Europa), Ley 20920 de REP (Chile), ISO 14001, GRI Standards, TCFD, SASB, y normativas locales según tu país. Actualizamos constantemente nuestra base de datos normativa.'
        },
        {
          q: '¿Cómo sé qué normativas aplican a mi empresa?',
          a: 'Al configurar tu organización, nuestro sistema analiza tu sector, ubicación y tamaño para identificar automáticamente las regulaciones aplicables. Te mostramos las brechas de cumplimiento y los pasos para cerrarlas.'
        },
        {
          q: '¿Generan reportes de cumplimiento automáticamente?',
          a: 'Sí, generamos reportes en formatos estándar (GRI, SASB, TCFD) listos para auditoría. Próximamente agregaremos exportación a formatos específicos de entidades reguladoras locales.'
        }
      ]
    },
    {
      category: 'SustentIA (Asistente IA)',
      icon: <QuestionAnswerIcon />,
      questions: [
        {
          q: '¿Qué puede hacer SustentIA?',
          a: 'SustentIA es tu asistente personal ESG. Puede analizar documentos, responder preguntas sobre normativas, sugerir acciones de mejora, explicar métricas, y ayudarte a entender tu impacto ambiental en lenguaje simple.'
        },
        {
          q: '¿SustentIA tiene acceso a mis datos privados?',
          a: 'SustentIA solo accede a los datos que específicamente compartes en la conversación. Toda la información se procesa con cifrado de extremo a extremo. Nunca compartimos tus datos con terceros ni los usamos para entrenar modelos públicos.'
        },
        {
          q: '¿En qué idiomas funciona SustentIA?',
          a: 'Actualmente funciona en Español e Inglés. Estamos trabajando en agregar Portugués y Francés basándonos en feedback de nuestros usuarios.'
        }
      ]
    },
    {
      category: 'Planes y Facturación',
      icon: <TrendingUpIcon />,
      questions: [
        {
          q: '¿Tienen plan gratuito?',
          a: 'Sí, nuestro plan Starter permite hasta 5 usuarios y 50 documentos/mes. Perfecto para empezar y evaluar la plataforma. Puedes actualizar en cualquier momento según tus necesidades.'
        },
        {
          q: '¿Puedo cancelar en cualquier momento?',
          a: 'Absolutamente. No hay contratos de permanencia. Puedes cancelar tu suscripción cuando quieras y seguirás teniendo acceso hasta el final del período pagado. También puedes exportar todos tus datos antes de irte.'
        },
        {
          q: '¿Ofrecen descuentos para ONGs o educación?',
          a: 'Sí, tenemos descuentos especiales del 50% para organizaciones sin fines de lucro, instituciones educativas y proyectos de impacto social. Contáctanos para más información.'
        }
      ]
    },
    {
      category: 'Seguridad y Privacidad',
      icon: <CheckIcon />,
      questions: [
        {
          q: '¿Dónde se almacenan mis datos?',
          a: 'Tus datos se almacenan en servidores seguros con certificación ISO 27001, con backups automáticos diarios. Cumplimos con GDPR y normativas locales de protección de datos.'
        },
        {
          q: '¿Quién puede ver mi información?',
          a: 'Solo los usuarios de tu organización que tú autorices. Los administradores de Sustenty nunca acceden a tus datos sin tu permiso explícito (excepto para soporte técnico cuando lo solicites).'
        },
        {
          q: '¿Puedo exportar y eliminar mis datos?',
          a: 'Sí, en cualquier momento puedes exportar todos tus datos en formato JSON o CSV desde Configuración > Datos. También puedes solicitar la eliminación completa de tu cuenta, cumpliendo con el derecho al olvido (GDPR).'
        }
      ]
    }
  ];

  const resources = [
    {
      title: 'Guía de Inicio Rápido',
      description: 'Aprende lo básico en 10 minutos',
      icon: <RocketIcon />,
      link: '#quick-start',
      color: 'primary'
    },
    {
      title: 'Documentación API',
      description: 'Integra Sustenty con tus sistemas',
      icon: <CodeIcon />,
      link: '/api/docs',
      color: 'secondary'
    },
    {
      title: 'Blog ESG',
      description: 'Artículos sobre sostenibilidad',
      icon: <ArticleIcon />,
      link: '#blog',
      color: 'success'
    },
    {
      title: 'Tutoriales en Video',
      description: 'Aprende viendo (próximamente)',
      icon: <MenuBookIcon />,
      link: '#videos',
      color: 'info'
    }
  ];

  const roadmap = [
    { quarter: 'Q1 2026', items: ['Integración con Google Sheets', 'Reportes TCFD automatizados', 'App móvil (iOS/Android)'], status: 'in-progress' },
    { quarter: 'Q2 2026', items: ['Análisis predictivo con ML', 'Marketplace de compensaciones de carbono', 'Multi-idioma (PT, FR)'], status: 'planned' },
    { quarter: 'Q3 2026', items: ['Blockchain para trazabilidad', 'Integraciones ERP (SAP, Oracle)', 'Certificaciones automatizadas'], status: 'planned' },
  ];

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box sx={{ mb: 6, mt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <HelpIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h3" component="h1" fontWeight={700}>
              Centro de Ayuda
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Informáticos ayudando al planeta 🌍
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Quiénes Somos */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #80cfc5 0%, #5fa99f 100%)', color: 'white' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              💚 Nuestra Misión
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
              Somos un equipo de <strong>ingenieros informáticos apasionados por la sostenibilidad</strong>. 
              Creemos que la tecnología puede ser la herramienta más poderosa para combatir el cambio climático.
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
              Sustenty nació de la frustración de ver cómo la gestión ESG sigue siendo manual, compleja y costosa. 
              Decidimos crear una plataforma que democratiza el acceso a herramientas de sostenibilidad de nivel enterprise, 
              <strong> para que cualquier empresa pueda medir, gestionar y reducir su impacto ambiental</strong>.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PeopleIcon sx={{ fontSize: 40, color: 'white' }} />
                    <Box>
                      <Typography variant="h5" fontWeight={700} color="white">5+</Typography>
                      <Typography variant="body2" color="white">Early Adopters</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <EcoIcon sx={{ fontSize: 40, color: 'white' }} />
                    <Box>
                      <Typography variant="h5" fontWeight={700} color="white">100%</Typography>
                      <Typography variant="body2" color="white">Open to Feedback</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Contacto Directo - Destacado */}
      <Alert severity="success" sx={{ mb: 4, py: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              🚀 Eres un Early Adopter - Tu feedback es oro para nosotros
            </Typography>
            <Typography variant="body2">
              Respondemos personalmente cada mensaje. Queremos construir Sustenty contigo.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<WhatsAppIcon />}
            href="https://wa.me/56912345678?text=Hola%20Sustenty,%20necesito%20ayuda%20con..."
            target="_blank"
            sx={{ minWidth: 200 }}
          >
            Chat en WhatsApp
          </Button>
        </Stack>
      </Alert>

      <Grid container spacing={4}>
        {/* FAQs */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            📚 Preguntas Frecuentes
          </Typography>

          {faqs.map((category, idx) => (
            <Box key={idx} sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                  {category.icon}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {category.category}
                </Typography>
              </Stack>

              {category.questions.map((faq, qIdx) => (
                <Accordion key={qIdx} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={500}>{faq.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">{faq.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}

          {/* Formulario de Contacto */}
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              ✉️ Envíanos un Mensaje
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Si no encuentras la respuesta que buscas, escríbenos. Te respondemos en menos de 24 horas.
            </Typography>

            <form onSubmit={handleContactSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tu nombre"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Asunto"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mensaje"
                    multiline
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={sending}
                    startIcon={sending ? null : <SendIcon />}
                    fullWidth
                  >
                    {sending ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Contacto Rápido */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              📞 Contacto Directo
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={
                    <MuiLink href="mailto:soporte@sustenty.io" underline="hover">
                      soporte@sustenty.io
                    </MuiLink>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WhatsAppIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="WhatsApp" 
                  secondary={
                    <MuiLink href="https://wa.me/56912345678" target="_blank" underline="hover">
                      +56 9 1234 5678
                    </MuiLink>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Ubicación" 
                  secondary="Santiago, Chile 🇨🇱"
                />
              </ListItem>
            </List>
          </Paper>

          {/* Recursos */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              📖 Recursos
            </Typography>
            <Stack spacing={2}>
              {resources.map((resource, idx) => (
                <Card key={idx} variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: `${resource.color}.light`, color: `${resource.color}.main` }}>
                        {resource.icon}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {resource.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {resource.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>

          {/* Roadmap */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              🗺️ Roadmap Público
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Construimos en público. Esto es lo que viene:
            </Typography>
            <Stack spacing={2}>
              {roadmap.map((quarter, idx) => (
                <Box key={idx}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Chip 
                      label={quarter.quarter} 
                      size="small" 
                      color={quarter.status === 'in-progress' ? 'primary' : 'default'}
                    />
                    {quarter.status === 'in-progress' && (
                      <Chip label="En progreso" size="small" color="success" variant="outlined" />
                    )}
                  </Stack>
                  <List dense>
                    {quarter.items.map((item, itemIdx) => (
                      <ListItem key={itemIdx} disablePadding>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  {idx < roadmap.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
              ))}
            </Stack>
            <Alert severity="info" sx={{ mt: 2 }} icon={false}>
              <Typography variant="caption">
                💡 <strong>¿Tienes una idea?</strong> Cuéntanos qué feature te gustaría ver. 
                Los early adopters tienen prioridad en el roadmap.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
