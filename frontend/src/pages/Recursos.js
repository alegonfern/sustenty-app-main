import { useState } from 'react';
import {
  Box, Grid, Typography, Stack, Card, CardContent, CardActions,
  Chip, Avatar, Button, TextField, InputAdornment,
  Divider, Tab, Tabs, IconButton, Tooltip, Alert
} from '@mui/material';
import {
  Search, BookOpen, Video, FileText, Globe, Download,
  ExternalLink, Star, Clock, Tag, Bookmark, BookMarked,
  Sparkles, GraduationCap, ShieldCheck, Leaf, BarChart3,
  FileBarChart2, ArrowRight, Play, Lock
} from 'lucide-react';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const TEAL   = '#10b981';
const DARK   = '#1a2e29';
const BLUE   = '#3b82f6';
const VIOLET = '#8b5cf6';
const AMBER  = '#f59e0b';

// ─── Catálogo de recursos ─────────────────────────────────────────────────────
const RECURSOS = [
  // ── Documentación Sustenty ──
  {
    id: 'r1', categoria: 'Sustenty',
    tipo: 'Guía',
    titulo: 'Guía de inicio rápido',
    descripcion: 'Configura tu organización, conecta tus fuentes de datos y genera tu primer reporte ESG en menos de 30 minutos.',
    color: TEAL, colorBg: '#d1fae5', Icon: BookOpen,
    tags: ['Onboarding', 'Setup'], destacado: true, nuevo: false,
    duracion: '10 min', nivel: 'Básico', accion: 'Leer guía', link: '#'
  },
  {
    id: 'r2', categoria: 'Sustenty',
    tipo: 'Video',
    titulo: 'Tour completo de la plataforma',
    descripcion: 'Recorrido visual por todos los módulos: Inventario, Agentes IA, Compliance y Reportes.',
    color: TEAL, colorBg: '#d1fae5', Icon: Video,
    tags: ['Demo', 'Plataforma'], destacado: true, nuevo: false,
    duracion: '18 min', nivel: 'Básico', accion: 'Ver video', link: '#'
  },
  {
    id: 'r3', categoria: 'Sustenty',
    tipo: 'Guía',
    titulo: 'Cómo usar los Agentes IA',
    descripcion: 'Activa, configura y obtén el máximo provecho de los agentes de medición, monitoreo y reporte automatizado.',
    color: TEAL, colorBg: '#d1fae5', Icon: Sparkles,
    tags: ['IA', 'Agentes'], destacado: false, nuevo: true,
    duracion: '12 min', nivel: 'Intermedio', accion: 'Leer guía', link: '#'
  },
  {
    id: 'r4', categoria: 'Sustenty',
    tipo: 'Video',
    titulo: 'Conectar integraciones y fuentes de datos',
    descripcion: 'Paso a paso para vincular ERPs, APIs y sistemas de facturación para alimentar automáticamente tu inventario de emisiones.',
    color: TEAL, colorBg: '#d1fae5', Icon: Video,
    tags: ['Integraciones', 'API'], destacado: false, nuevo: true,
    duracion: '22 min', nivel: 'Intermedio', accion: 'Ver video', link: '#'
  },
  // ── Normativas y Estándares ──
  {
    id: 'r5', categoria: 'Normativas',
    tipo: 'Estándar',
    titulo: 'GHG Protocol — Corporate Standard',
    descripcion: 'Marco internacional para la medición y reporte de emisiones de gases de efecto invernadero. Base de los Scope 1, 2 y 3.',
    color: BLUE, colorBg: '#dbeafe', Icon: Globe,
    tags: ['GHG', 'Scope 1/2/3', 'Emisiones'], destacado: true, nuevo: false,
    duracion: 'PDF · 116 pág.', nivel: 'Avanzado', accion: 'Descargar', link: 'https://ghgprotocol.org'
  },
  {
    id: 'r6', categoria: 'Normativas',
    tipo: 'Estándar',
    titulo: 'ISO 14064-1:2018 — Cuantificación de GEI',
    descripcion: 'Especificaciones y orientaciones para la cuantificación e informe de las emisiones y remociones de gases de efecto invernadero.',
    color: BLUE, colorBg: '#dbeafe', Icon: ShieldCheck,
    tags: ['ISO', 'GEI', 'Verificación'], destacado: false, nuevo: false,
    duracion: 'PDF · 34 pág.', nivel: 'Avanzado', accion: 'Descargar', link: '#'
  },
  {
    id: 'r7', categoria: 'Normativas',
    tipo: 'Regulación',
    titulo: 'CSRD — Corporate Sustainability Reporting Directive',
    descripcion: 'Directiva europea que exige a empresas grandes la divulgación de información de sostenibilidad bajo estándares ESRS.',
    color: BLUE, colorBg: '#dbeafe', Icon: FileText,
    tags: ['CSRD', 'ESRS', 'Europa'], destacado: true, nuevo: false,
    duracion: 'PDF · 80 pág.', nivel: 'Avanzado', accion: 'Leer', link: '#'
  },
  {
    id: 'r8', categoria: 'Normativas',
    tipo: 'Regulación',
    titulo: 'CNBV — Lineamientos de Finanzas Sostenibles (México)',
    descripcion: 'Regulación de la CNBV sobre divulgación de riesgos climáticos y ESG para emisoras en el mercado mexicano.',
    color: BLUE, colorBg: '#dbeafe', Icon: ShieldCheck,
    tags: ['CNBV', 'México', 'Finanzas'], destacado: false, nuevo: false,
    duracion: 'PDF · 48 pág.', nivel: 'Avanzado', accion: 'Descargar', link: '#'
  },
  {
    id: 'r9', categoria: 'Normativas',
    tipo: 'Estándar',
    titulo: 'GRI Standards 2021 — Guía completa',
    descripcion: 'Estándares GRI para reportes de sostenibilidad. El framework más usado a nivel global para divulgación ESG.',
    color: BLUE, colorBg: '#dbeafe', Icon: BookOpen,
    tags: ['GRI', 'Reporte', 'ESG'], destacado: true, nuevo: false,
    duracion: 'PDF · 230 pág.', nivel: 'Avanzado', accion: 'Descargar', link: 'https://www.globalreporting.org'
  },
  // ── Sostenibilidad & Aprende ──
  {
    id: 'r10', categoria: 'Aprende',
    tipo: 'Artículo',
    titulo: '¿Qué es el Net Zero y cómo lograrlo?',
    descripcion: 'Explicación clara de la neutralidad de carbono, diferencias entre Net Zero y carbono neutro, y hoja de ruta básica para empresas.',
    color: VIOLET, colorBg: '#ede9fe', Icon: Leaf,
    tags: ['Net Zero', 'Estrategia'], destacado: false, nuevo: false,
    duracion: '8 min', nivel: 'Básico', accion: 'Leer', link: '#'
  },
  {
    id: 'r11', categoria: 'Aprende',
    tipo: 'Video',
    titulo: 'Economía circular: reducir Scope 3 desde el diseño',
    descripcion: 'Cómo integrar principios de economía circular para reducir las emisiones de Scope 3 en la cadena de valor.',
    color: VIOLET, colorBg: '#ede9fe', Icon: Video,
    tags: ['Scope 3', 'Economía circular'], destacado: false, nuevo: true,
    duracion: '25 min', nivel: 'Intermedio', accion: 'Ver video', link: '#'
  },
  {
    id: 'r12', categoria: 'Aprende',
    tipo: 'Artículo',
    titulo: 'Taxonomía verde de la UE — Guía para empresas',
    descripcion: 'Qué es la taxonomía verde europea, cómo aplicarla y qué actividades económicas se consideran "sostenibles" bajo este marco.',
    color: VIOLET, colorBg: '#ede9fe', Icon: BarChart3,
    tags: ['Taxonomía', 'UE', 'Finanzas verdes'], destacado: false, nuevo: false,
    duracion: '12 min', nivel: 'Intermedio', accion: 'Leer', link: '#'
  },
  {
    id: 'r13', categoria: 'Aprende',
    tipo: 'Video',
    titulo: 'SBTi — Cómo establecer metas basadas en ciencia',
    descripcion: 'Introducción a Science Based Targets Initiative: qué son, cómo validar tus metas de reducción y pasos para comprometerte.',
    color: VIOLET, colorBg: '#ede9fe', Icon: FileBarChart2,
    tags: ['SBTi', 'Metas', 'Ciencia'], destacado: true, nuevo: false,
    duracion: '31 min', nivel: 'Avanzado', accion: 'Ver video', link: '#'
  }
];

const CATEGORIAS = ['Todos', 'Sustenty', 'Normativas', 'Aprende'];

const TIPO_ICON = { Guía: BookOpen, Video: Play, Estándar: ShieldCheck, Regulación: FileText, Artículo: BookMarked };
const NIVEL_COLOR = { Básico: TEAL, Intermedio: AMBER, Avanzado: VIOLET };

// ─── Resource Card ─────────────────────────────────────────────────────────────
function ResourceCard({ recurso }) {
  const [saved, setSaved] = useState(false);
  const { titulo, descripcion, color, colorBg, Icon, tags, destacado, nuevo,
          duracion, nivel, accion, tipo, link } = recurso;
  const TipoIcon = TIPO_ICON[tipo] || FileText;
  const nivelColor = NIVEL_COLOR[nivel] || TEAL;
  const isVideo = tipo === 'Video';
  const isExternal = link && link !== '#';

  return (
    <Card elevation={0} sx={{
      border: '1.5px solid', borderColor: 'divider', borderRadius: 3,
      height: '100%', display: 'flex', flexDirection: 'column',
      transition: 'all 0.2s',
      '&:hover': { borderColor: color, boxShadow: `0 4px 20px ${color}18`, transform: 'translateY(-2px)' }
    }}>
      <CardContent sx={{ flex: 1, pb: 1 }}>
        {/* Top chips */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            <Chip icon={<TipoIcon size={11} />} label={tipo} size="small"
              sx={{ fontSize: '0.65rem', height: 20, bgcolor: colorBg, color, fontWeight: 700,
                '& .MuiChip-icon': { color } }} />
            {nuevo && <Chip label="Nuevo" size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#fef3c7', color: AMBER, fontWeight: 700 }} />}
            {destacado && <Chip icon={<Star size={9} />} label="Destacado" size="small"
              sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#fef3c7', color: AMBER, fontWeight: 700, '& .MuiChip-icon': { color: AMBER } }} />}
          </Stack>
          <IconButton size="small" onClick={() => setSaved(s => !s)}
            sx={{ color: saved ? AMBER : 'text.disabled', ml: 0.5 }}>
            <Bookmark size={15} fill={saved ? AMBER : 'none'} />
          </IconButton>
        </Stack>

        {/* Icono + título */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: colorBg, flexShrink: 0 }}>
            <Icon size={18} color={color} />
          </Avatar>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3, color: DARK }}>
            {titulo}
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1.5, fontSize: '0.8rem' }}>
          {descripcion}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mb: 1.5 }}>
          {tags.map(t => (
            <Chip key={t} label={t} size="small" icon={<Tag size={9} />}
              sx={{ fontSize: '0.62rem', height: 18, '& .MuiChip-icon': { color: 'text.disabled' } }} />
          ))}
        </Stack>

        {/* Meta */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Clock size={12} color="text.secondary" />
            <Typography variant="caption" color="text.disabled">{duracion}</Typography>
          </Stack>
          <Chip label={nivel} size="small"
            sx={{ fontSize: '0.62rem', height: 18, bgcolor: `${nivelColor}15`, color: nivelColor, fontWeight: 700 }} />
        </Stack>
      </CardContent>

      <Divider />
      <CardActions sx={{ px: 2, py: 1.25 }}>
        <Button
          size="small" fullWidth
          variant={destacado ? 'contained' : 'outlined'}
          startIcon={isVideo ? <Play size={13} /> : isExternal ? <ExternalLink size={13} /> : <Download size={13} />}
          href={link !== '#' ? link : undefined}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
            ...(destacado
              ? { bgcolor: color, '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }
              : { borderColor: `${color}55`, color })
          }}
        >
          {accion}
        </Button>
      </CardActions>
    </Card>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Recursos() {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');

  const catActual = CATEGORIAS[tab];
  const filtered = RECURSOS.filter(r => {
    const matchCat = catActual === 'Todos' || r.categoria === catActual;
    const q = query.toLowerCase();
    const matchQ = !q || r.titulo.toLowerCase().includes(q) || r.descripcion.toLowerCase().includes(q)
      || r.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  const destacados = RECURSOS.filter(r => r.destacado).slice(0, 3);

  return (
    <Box>
      {/* Header */}
      <Stack spacing={0.5} sx={{ mb: 4 }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 600, letterSpacing: 1.5 }}>
          Centro de información
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: DARK }}>Recursos</Typography>
        <Typography variant="body1" color="text.secondary">
          Documentación, tutoriales en video, normativas ISO y marcos de sostenibilidad — todo en un solo lugar.
        </Typography>
      </Stack>

      {/* Stats bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap">
        {[
          { label: 'Recursos disponibles', value: RECURSOS.length, color: TEAL },
          { label: 'Guías y artículos', value: RECURSOS.filter(r => r.tipo !== 'Video').length, color: BLUE },
          { label: 'Videos', value: RECURSOS.filter(r => r.tipo === 'Video').length, color: VIOLET }
        ].map(({ label, value, color }) => (
          <Box key={label} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
            borderRadius: 2, px: 2.5, py: 1.5, minWidth: 140 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        ))}
      </Stack>

      {/* Destacados */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Star size={16} color={AMBER} fill={AMBER} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DARK }}>Destacados</Typography>
        </Stack>
        <Grid container spacing={2.5}>
          {destacados.map(r => (
            <Grid item xs={12} md={4} key={r.id} sx={{ display: 'flex' }}>
              <ResourceCard recurso={r} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Búsqueda + Tabs */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ flex: 1,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 40 },
          '& .Mui-selected': { color: TEAL } ,
          '& .MuiTabs-indicator': { bgcolor: TEAL }
        }}>
          {CATEGORIAS.map((c, i) => (
            <Tab key={c} label={
              <Stack direction="row" spacing={0.75} alignItems="center">
                <span>{c}</span>
                <Chip label={i === 0 ? RECURSOS.length : RECURSOS.filter(r => r.categoria === c).length}
                  size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
              </Stack>
            } />
          ))}
        </Tabs>
        <TextField
          size="small"
          placeholder="Buscar recursos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          sx={{ minWidth: 240 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search size={15} color="#9ca3af" /></InputAdornment>,
            sx: { borderRadius: 2 }
          }}
        />
      </Stack>

      {/* Grid principal */}
      {filtered.length === 0 ? (
        <Alert severity="info" icon={<Search size={18} />} sx={{ borderRadius: 2 }}>
          No se encontraron recursos para "{query}".
        </Alert>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map(r => (
            <Grid item xs={12} sm={6} md={4} key={r.id} sx={{ display: 'flex' }}>
              <ResourceCard recurso={r} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* CTA próximamente */}
      <Box sx={{ mt: 5, border: '1.5px dashed', borderColor: 'divider', borderRadius: 3, p: 3, textAlign: 'center' }}>
        <Stack alignItems="center" spacing={1.5}>
          <Avatar sx={{ width: 52, height: 52, bgcolor: '#f0fdf4' }}>
            <GraduationCap size={24} color={TEAL} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DARK }}>
              Academia Sustenty — <strong>Próximamente</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
              Cursos certificados en ESG, medición de huella de carbono y reporte CSRD. Aprende a tu ritmo con rutas de aprendizaje estructuradas.
            </Typography>
          </Box>
          <Button disabled variant="outlined" startIcon={<Lock size={14} />} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Próximamente disponible
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
