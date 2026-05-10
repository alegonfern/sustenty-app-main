
import { useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Stack, Grid, Card, CardContent, CardActions,
  Chip, Tooltip, Divider, Avatar, Switch, FormControlLabel,
  Alert, Select, MenuItem, InputLabel, FormControl, IconButton
} from '@mui/material';
import {
  Plus, Leaf, BarChart3, FileBarChart2, Settings2,
  CheckCircle2, Zap, Package, Lock, Sparkles,
  BarChart2, Bell, RefreshCw, X, ChevronRight
} from 'lucide-react';


// ─── Catálogo de agentes ──────────────────────────────────────────────────────
const COMING_SOON = [
  {
    id: 'reduccion-emisiones',
    nombre: 'Reducción de Emisiones',
    tagline: 'Optimización automática de Scope 1 y 2',
    descripcion:
      'Analiza tus principales fuentes de emisión y propone planes de acción priorizados por impacto y costo para alcanzar tus metas de reducción.'
  },
  {
    id: 'cadena-suministro',
    nombre: 'Cadena de Suministro',
    tagline: 'Emisiones Scope 3 de proveedores',
    descripcion:
      'Evalúa la huella de carbono de tus proveedores clave, detecta riesgos ESG en la cadena y genera scorecard de sostenibilidad por proveedor.'
  },
  {
    id: 'agua-residuos',
    nombre: 'Agua & Residuos',
    tagline: 'Gestión de recursos naturales',
    descripcion:
      'Monitorea el consumo de agua y la generación de residuos, identifica oportunidades de economía circular y calcula indicadores GRI 303 y GRI 306.'
  },
  {
    id: 'diversidad-inclusion',
    nombre: 'Diversidad & Inclusión',
    tagline: 'Indicadores sociales y de equidad',
    descripcion:
      'Recopila y analiza datos de diversidad, equidad e inclusión. Genera brechas salariales de género, representación por nivel jerárquico y recomendaciones de mejora.'
  },
  {
    id: 'estrategia-net-zero',
    nombre: 'Estrategia Net Zero',
    tagline: 'Hoja de ruta hacia carbono neutro',
    descripcion:
      'Modela diferentes escenarios de descarbonización y construye una hoja de ruta personalizada hacia Net Zero alineada con SBTi y el Acuerdo de París.'
  }
];

const CATALOG = [
  {
    id: 'huella-co2',
    nombre: 'Medición Huella CO₂',
    tagline: 'Cálculo automático de emisiones GEI',
    descripcion:
      'Recopila y normaliza datos desde facturas, consumos e integraciones conectadas para calcular automáticamente las emisiones de gases de efecto invernadero por Scope.',
    color: '#10b981',
    colorBg: '#d1fae5',
    Icon: Leaf,
    tags: ['GHG Protocol', 'Scope 1/2/3', 'CO₂e'],
    frecuencia: 'mensual',
    notificaciones: true,
    entregables: [
      { nombre: 'Registro de emisiones Scope 1, 2 y 3', tipo: 'Dataset', Ico: BarChart2 },
      { nombre: 'Dashboard de huella de carbono', tipo: 'Visualización', Ico: BarChart3 },
      { nombre: 'Factor de emisión por proveedor', tipo: 'Análisis', Ico: Zap },
      { nombre: 'Histórico mensual de emisiones', tipo: 'Reporte', Ico: RefreshCw },
      { nombre: 'Alertas de desviación de metas', tipo: 'Alerta', Ico: Bell },
    ]
  },
  {
    id: 'monitoreo-esg',
    nombre: 'Monitoreo ESG',
    tagline: 'Vigilancia continua de indicadores ESG',
    descripcion:
      'Monitorea en tiempo real los indicadores Ambientales, Sociales y de Gobernanza de tu organización. Detecta brechas de forma proactiva y prioriza acciones de mejora.',
    color: '#3b82f6',
    colorBg: '#dbeafe',
    Icon: BarChart3,
    tags: ['GRI', 'SASB', 'ESG Score'],
    frecuencia: 'semanal',
    notificaciones: true,
    entregables: [
      { nombre: 'Panel de indicadores E, S y G', tipo: 'Visualización', Ico: BarChart3 },
      { nombre: 'Semáforo de cumplimiento ESG', tipo: 'Dashboard', Ico: CheckCircle2 },
      { nombre: 'Recomendaciones de mejora priorizadas', tipo: 'Análisis', Ico: Sparkles },
      { nombre: 'Comparativa vs. benchmarks de industria', tipo: 'Reporte', Ico: BarChart2 },
      { nombre: 'Alertas de incumplimiento', tipo: 'Alerta', Ico: Bell },
    ]
  },
  {
    id: 'reporte-esg',
    nombre: 'Reporte ESG',
    tagline: 'Generación automática de informes regulatorios',
    descripcion:
      'Genera los informes y reportes de sostenibilidad exigidos por marcos internacionales como CSRD, GRI, CDP y CNBV — en formato listo para publicar.',
    color: '#8b5cf6',
    colorBg: '#ede9fe',
    Icon: FileBarChart2,
    tags: ['CSRD', 'GRI', 'CDP', 'CNBV'],
    frecuencia: 'trimestral',
    notificaciones: false,
    entregables: [
      { nombre: 'Reporte GRI Standards', tipo: 'Informe', Ico: FileBarChart2 },
      { nombre: 'Reporte CSRD / ESRS', tipo: 'Informe', Ico: FileBarChart2 },
      { nombre: 'Reporte CDP (Carbono)', tipo: 'Informe', Ico: FileBarChart2 },
      { nombre: 'Memoria anual de sostenibilidad', tipo: 'Informe', Ico: FileBarChart2 },
      { nombre: 'Informe CNBV (México)', tipo: 'Informe', Ico: FileBarChart2 },
    ]
  }
];

const TIPO_STYLE = {
  Dataset:      { bg: '#f0fdf4', color: '#16a34a' },
  Visualización:{ bg: '#eff6ff', color: '#2563eb' },
  Alerta:       { bg: '#fef3c7', color: '#b45309' },
  Reporte:      { bg: '#f3e8ff', color: '#7c3aed' },
  Análisis:     { bg: '#fce7f3', color: '#be185d' },
  Dashboard:    { bg: '#ecfeff', color: '#0891b2' },
  Informe:      { bg: '#f5f3ff', color: '#6d28d9' }
};

// ─── Card de agente ───────────────────────────────────────────────────────────
function AgentCard({ agent, activo, onToggle, onConfigure }) {
  const { nombre, tagline, descripcion, color, colorBg, Icon, tags, entregables } = agent;

  return (
    <Card
      elevation={0}
      sx={{
        border: '1.5px solid',
        borderColor: activo ? color : 'divider',
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s ease',
        boxShadow: activo ? `0 0 0 3px ${color}22` : 'none',
        '&:hover': {
          boxShadow: `0 4px 24px ${color}22`,
          borderColor: color,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Header de color */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${color}18 0%, ${colorBg} 100%)`,
          borderBottom: `1px solid ${color}22`,
          px: 3, pt: 3, pb: 2,
          position: 'relative'
        }}
      >
        {/* Icono en esquina superior derecha */}
        <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
          <Avatar
            sx={{
              width: 52, height: 52,
              bgcolor: color,
              boxShadow: `0 4px 12px ${color}44`
            }}
          >
            <Icon size={26} color="#fff" />
          </Avatar>
        </Box>

        {/* Chip activo */}
        {activo && (
          <Chip
            icon={<CheckCircle2 size={12} />}
            label="Activo"
            size="small"
            sx={{
              bgcolor: color, color: '#fff',
              fontWeight: 700, fontSize: '0.7rem',
              mb: 1,
              '& .MuiChip-icon': { color: '#fff' }
            }}
          />
        )}

        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2e29', pr: 7, lineHeight: 1.2 }}>
          {nombre}
        </Typography>
        <Typography variant="caption" sx={{ color, fontWeight: 600, letterSpacing: 0.3 }}>
          {tagline}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1.5, gap: 0.5 }}>
          {tags.map(t => (
            <Chip key={t} label={t} size="small" variant="outlined"
              sx={{ fontSize: '0.65rem', borderColor: `${color}55`, color, height: 20 }} />
          ))}
        </Stack>
      </Box>

      {/* Body */}
      <CardContent sx={{ flex: 1, pt: 2, pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
          {descripcion}
        </Typography>

        {/* Entregables */}
        <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 1.5 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.25 }}>
            <Package size={14} color={color} />
            <Typography variant="caption" sx={{ fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Entregables
            </Typography>
          </Stack>
          <Stack spacing={0.85}>
            {entregables.map((e) => {
              const ts = TIPO_STYLE[e.tipo] || {};
              return (
                <Stack key={e.nombre} direction="row" spacing={1} alignItems="center">
                  <ChevronRight size={12} color={color} style={{ flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ flex: 1, color: 'text.primary', lineHeight: 1.4 }}>
                    {e.nombre}
                  </Typography>
                  <Chip
                    label={e.tipo}
                    size="small"
                    sx={{
                      fontSize: '0.6rem', height: 18,
                      bgcolor: ts.bg, color: ts.color,
                      fontWeight: 600, flexShrink: 0
                    }}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </CardContent>

      {/* Footer con switch + botón */}
      <Divider />
      <CardActions sx={{ px: 2.5, py: 1.75, justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Switch personalizado */}
        <Box
          onClick={onToggle}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            cursor: 'pointer',
            px: 1.5, py: 0.75, borderRadius: 99,
            bgcolor: activo ? `${color}15` : 'action.hover',
            border: '1px solid',
            borderColor: activo ? `${color}44` : 'divider',
            transition: 'all 0.2s',
            userSelect: 'none'
          }}
        >
          <Box
            sx={{
              width: 36, height: 20, borderRadius: 10,
              bgcolor: activo ? color : 'grey.300',
              position: 'relative', transition: 'background 0.2s',
              flexShrink: 0
            }}
          >
            <Box sx={{
              position: 'absolute', top: 3, left: activo ? 18 : 3,
              width: 14, height: 14, borderRadius: '50%',
              bgcolor: '#fff', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,.2)'
            }} />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: activo ? color : 'text.secondary', minWidth: 52 }}>
            {activo ? 'Activado' : 'Activar'}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          startIcon={<Settings2 size={14} />}
          onClick={onConfigure}
          sx={{
            borderRadius: 2, fontSize: '0.75rem',
            borderColor: 'divider', color: 'text.primary',
            '&:hover': { borderColor: color, color }
          }}
        >
          Configurar
        </Button>
      </CardActions>
    </Card>
  );
}

// ─── Dialog de configuración ──────────────────────────────────────────────────
function ConfigDialog({ agent, activo, config, onClose, onSave }) {
  const [local, setLocal] = useState({ ...config });

  if (!agent) return null;
  const { color } = agent;

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: color }}>
              <agent.Icon size={18} color="#fff" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {agent.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">Configuración del agente</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose}><X size={18} /></IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Frecuencia de ejecución</InputLabel>
            <Select
              value={local.frecuencia}
              label="Frecuencia de ejecución"
              onChange={e => setLocal({ ...local, frecuencia: e.target.value })}
            >
              {['diaria', 'semanal', 'mensual', 'trimestral'].map(f => (
                <MenuItem key={f} value={f} sx={{ textTransform: 'capitalize' }}>{f.charAt(0).toUpperCase() + f.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 2, py: 1.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={local.notificaciones}
                  onChange={e => setLocal({ ...local, notificaciones: e.target.checked })}
                  size="small"
                  sx={{ '& .MuiSwitch-thumb': { bgcolor: color }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: `${color}80` } }}
                />
              }
              label={<Typography variant="body2">Notificaciones por correo</Typography>}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              Recibe un resumen cuando el agente genere nuevos entregables.
            </Typography>
          </Box>

          {/* Entregables habilitados */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary' }}>
              Entregables activos
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {agent.entregables.map((e) => (
                <Stack key={e.nombre} direction="row" alignItems="center" justifyContent="space-between"
                  sx={{ bgcolor: 'grey.50', borderRadius: 1.5, px: 1.5, py: 0.75 }}>
                  <Typography variant="caption" sx={{ flex: 1 }}>{e.nombre}</Typography>
                  <CheckCircle2 size={14} color={color} />
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} size="small">Cancelar</Button>
        <Button
          variant="contained" size="small"
          onClick={() => onSave(local)}
          sx={{ bgcolor: color, '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }}
        >
          Guardar cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function MisAgentes() {
  // Estado activo por agente
  const [activos, setActivos] = useState({ 'huella-co2': false, 'monitoreo-esg': false, 'reporte-esg': false });
  // Config por agente
  const [configs, setConfigs] = useState(
    Object.fromEntries(CATALOG.map(a => [a.id, { frecuencia: a.frecuencia, notificaciones: a.notificaciones }]))
  );
  const [configAgent, setConfigAgent] = useState(null); // id del agente en configuración

  const totalActivos = Object.values(activos).filter(Boolean).length;

  const handleToggle = (id) => setActivos(prev => ({ ...prev, [id]: !prev[id] }));
  const handleSaveConfig = (config) => {
    setConfigs(prev => ({ ...prev, [configAgent]: config }));
    setConfigAgent(null);
  };

  return (
    <Box>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 600, letterSpacing: 1.5 }}>
            IA Automatizada
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2e29', mb: 0.5 }}>
            Agentes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Activa agentes de IA especializados para automatizar medición, monitoreo y reporte de sostenibilidad.
          </Typography>
        </Box>

        <Tooltip
          title={
            <Stack spacing={0.5} alignItems="center" sx={{ py: 0.5 }}>
              <Lock size={14} />
              <Typography variant="caption">Próximamente</Typography>
            </Stack>
          }
          placement="left"
        >
          <span>
            <Button
              variant="contained"
              disabled
              startIcon={<Plus size={16} />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Crear Agente
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/* ── Stats bar ── */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap">
        {[
          { label: 'Agentes disponibles', value: CATALOG.length, color: '#10b981' },
          { label: 'Agentes activos', value: totalActivos, color: totalActivos > 0 ? '#10b981' : 'text.secondary' },
          { label: 'Entregables totales', value: CATALOG.reduce((s, a) => s + a.entregables.length, 0), color: '#8b5cf6' }
        ].map(({ label, value, color }) => (
          <Box key={label}
            sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 2.5, py: 1.5, minWidth: 140 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Box>
        ))}
      </Stack>

      {/* ── Banner si no hay activos ── */}
      {totalActivos === 0 && (
        <Alert
          severity="info"
          icon={<Sparkles size={18} />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          Activa al menos un agente para comenzar a automatizar tu gestión de sostenibilidad.
        </Alert>
      )}

      {/* ── Grid de cards disponibles ── */}
      <Grid container spacing={3}>
        {CATALOG.map(agent => (
          <Grid item xs={12} md={4} key={agent.id} sx={{ display: 'flex' }}>
            <AgentCard
              agent={agent}
              activo={activos[agent.id]}
              onToggle={() => handleToggle(agent.id)}
              onConfigure={() => setConfigAgent(agent.id)}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Próximamente ── */}
      <Box sx={{ mt: 5, mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
          <Stack direction="row" spacing={1} alignItems="center"
            sx={{ px: 2, py: 0.75, bgcolor: 'grey.100', borderRadius: 99, border: '1px solid', borderColor: 'divider' }}>
            <Lock size={13} color="#9ca3af" />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', letterSpacing: 1 }}>PRÓXIMAMENTE</Typography>
          </Stack>
          <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
        </Stack>
        <Grid container spacing={2.5}>
          {COMING_SOON.map(a => (
            <Grid item xs={12} sm={6} md={4} key={a.id}>
              <Card elevation={0} sx={{
                border: '1.5px dashed', borderColor: 'divider',
                borderRadius: 3, opacity: 0.7,
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 1 }
              }}>
                <CardContent sx={{ pb: '16px !important' }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Chip
                      icon={<Lock size={11} />}
                      label="Próximamente"
                      size="small"
                      sx={{ fontSize: '0.65rem', bgcolor: 'grey.100', color: 'text.disabled',
                        height: 20, fontWeight: 700,
                        '& .MuiChip-icon': { color: 'text.disabled' } }}
                    />
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'grey.100',
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={16} color="#9ca3af" />
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                    <strong>{a.nombre}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, display: 'block', mb: 1 }}>
                    {a.tagline}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.78rem' }}>
                    {a.descripcion}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── Dialog configuración ── */}
      {configAgent && (
        <ConfigDialog
          agent={CATALOG.find(a => a.id === configAgent)}
          activo={activos[configAgent]}
          config={configs[configAgent]}
          onClose={() => setConfigAgent(null)}
          onSave={handleSaveConfig}
        />
      )}
    </Box>
  );
}
