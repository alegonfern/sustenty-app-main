import { useState } from 'react';
import {
  Box, Grid, Typography, Stack, Card, CardContent, Chip,
  Avatar, LinearProgress, Divider, Button, Tooltip,
  Table, TableBody, TableCell, TableHead, TableRow,
  ToggleButtonGroup, ToggleButton, Alert
} from '@mui/material';
import {
  Leaf, BarChart3, FileBarChart2, Sparkles,
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle2,
  Zap, Droplets, Recycle, Users, ArrowRight,
  Activity, Target, RefreshCw, Bell, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const TEAL   = '#10b981';
const DARK   = '#1a2e29';
const BLUE   = '#3b82f6';
const VIOLET = '#8b5cf6';
const AMBER  = '#f59e0b';
const ROSE   = '#f43f5e';

// ─── Datos mock ───────────────────────────────────────────────────────────────
const KPI_CARDS = [
  {
    label: 'Emisiones totales',
    value: '142.3',
    unit: 'tCO₂e',
    delta: -8.4,
    deltaLabel: 'vs mes anterior',
    color: TEAL,
    colorBg: '#d1fae5',
    Icon: Leaf,
    trend: 'down_good'
  },
  {
    label: 'Score ESG',
    value: '71',
    unit: '/ 100',
    delta: +4,
    deltaLabel: 'vs trimestre anterior',
    color: BLUE,
    colorBg: '#dbeafe',
    Icon: BarChart3,
    trend: 'up_good'
  },
  {
    label: 'Intensidad CO₂',
    value: '0.38',
    unit: 'tCO₂e/M$',
    delta: -12.1,
    deltaLabel: 'vs año anterior',
    color: VIOLET,
    colorBg: '#ede9fe',
    Icon: Zap,
    trend: 'down_good'
  },
  {
    label: 'Alertas activas',
    value: '3',
    unit: 'alertas',
    delta: +1,
    deltaLabel: 'nuevas esta semana',
    color: AMBER,
    colorBg: '#fef3c7',
    Icon: Bell,
    trend: 'up_bad'
  }
];

const SCOPE_DATA = [
  { scope: 'Scope 1', label: 'Emisiones directas', value: 34.2, pct: 24, color: TEAL,   detail: 'Combustión, refrigerantes, flota propia' },
  { scope: 'Scope 2', label: 'Energía comprada',   value: 48.7, pct: 34, color: BLUE,   detail: 'Electricidad, vapor, calefacción' },
  { scope: 'Scope 3', label: 'Cadena de valor',    value: 59.4, pct: 42, color: VIOLET, detail: 'Proveedores, viajes, residuos, productos' }
];

const ESG_PILLARS = [
  {
    pilar: 'Ambiental',
    score: 74,
    color: TEAL,
    Icon: Leaf,
    indicadores: [
      { nombre: 'Reducción CO₂ vs meta',    valor: '67%',  ok: true  },
      { nombre: 'Consumo de agua',           valor: '-5%',  ok: true  },
      { nombre: 'Residuos gestionados',      valor: '82%',  ok: true  },
      { nombre: 'Energía renovable',         valor: '41%',  ok: false }
    ]
  },
  {
    pilar: 'Social',
    score: 68,
    color: BLUE,
    Icon: Users,
    indicadores: [
      { nombre: 'Índice de diversidad',      valor: '0.72', ok: true  },
      { nombre: 'Horas de capacitación',     valor: '14h',  ok: false },
      { nombre: 'Satisfacción empleados',    valor: '81%',  ok: true  },
      { nombre: 'Brecha salarial de género', valor: '8%',   ok: false }
    ]
  },
  {
    pilar: 'Gobernanza',
    score: 79,
    color: VIOLET,
    Icon: FileBarChart2,
    indicadores: [
      { nombre: 'Políticas anti-corrupción', valor: '100%', ok: true  },
      { nombre: 'Reportes regulatorios',     valor: '3/4',  ok: false },
      { nombre: 'Directorio diverso',        valor: '55%',  ok: true  },
      { nombre: 'Auditorías externas',       valor: 'OK',   ok: true  }
    ]
  }
];

const AI_INSIGHTS = [
  {
    agente: 'Medición Huella CO₂',
    tipo: 'alerta',
    color: AMBER,
    Icon: AlertTriangle,
    mensaje: 'Las emisiones de Scope 3 subieron un 6% este mes respecto al promedio. Principal causa: compras de materias primas (+12%). Se recomienda revisar 3 proveedores críticos.',
    accion: 'Ver análisis'
  },
  {
    agente: 'Monitoreo ESG',
    tipo: 'oportunidad',
    color: TEAL,
    Icon: CheckCircle2,
    mensaje: 'Tu score Ambiental subió 4 puntos tras el cambio en gestión de residuos. Estás 8% por encima del promedio de tu sector. Meta Q3 alcanzable.',
    accion: 'Ver detalle'
  },
  {
    agente: 'Reporte ESG',
    tipo: 'info',
    color: BLUE,
    Icon: Info,
    mensaje: 'El borrador del reporte CSRD para el período Ene–Mar está listo para revisión. Faltan completar 4 indicadores ESRS E1 antes de la fecha límite (30 jun).',
    accion: 'Revisar reporte'
  }
];

const EMISIONES_MENSUAL = [
  { mes: 'Nov', v: 168 }, { mes: 'Dic', v: 175 }, { mes: 'Ene', v: 162 },
  { mes: 'Feb', v: 155 }, { mes: 'Mar', v: 158 }, { mes: 'Abr', v: 149 },
  { mes: 'May', v: 142 }
];

const PROVEEDORES_TOP = [
  { nombre: 'LogiTrans Chile', scope: 3, tco2e: 18.4, riesgo: 'alto',   trend: +12 },
  { nombre: 'Proveedor Energía SA', scope: 2, tco2e: 14.1, riesgo: 'medio', trend: -3 },
  { nombre: 'Materiales XYZ',  scope: 3, tco2e: 11.8, riesgo: 'medio', trend: +4 },
  { nombre: 'Servicios Cloud', scope: 2, tco2e: 8.2,  riesgo: 'bajo',  trend: -8 },
  { nombre: 'Packaging Verde', scope: 3, tco2e: 6.5,  riesgo: 'bajo',  trend: -15 }
];

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ height: 64, pt: 1 }}>
      {data.map(({ mes, v }) => (
        <Box key={mes} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{
            width: '100%', borderRadius: '3px 3px 0 0',
            bgcolor: color,
            height: `${(v / max) * 52}px`,
            opacity: mes === 'May' ? 1 : 0.45,
            transition: 'height 0.4s'
          }} />
          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>{mes}</Typography>
        </Box>
      ))}
    </Stack>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, unit, delta, deltaLabel, color, colorBg, Icon, trend }) {
  const isGood = (trend === 'down_good' && delta < 0) || (trend === 'up_good' && delta > 0);
  const TrendIcon = delta > 0 ? TrendingUp : TrendingDown;
  return (
    <Card elevation={0} sx={{
      border: '1.5px solid', borderColor: 'divider', borderRadius: 3,
      transition: 'all 0.2s',
      '&:hover': { borderColor: color, boxShadow: `0 4px 20px ${color}22`, transform: 'translateY(-1px)' }
    }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {label}
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ my: 0.75 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: DARK, lineHeight: 1 }}>{value}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{unit}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TrendIcon size={13} color={isGood ? TEAL : ROSE} />
              <Typography variant="caption" sx={{ color: isGood ? TEAL : ROSE, fontWeight: 700 }}>
                {delta > 0 ? '+' : ''}{delta}%
              </Typography>
              <Typography variant="caption" color="text.disabled">{deltaLabel}</Typography>
            </Stack>
          </Box>
          <Avatar sx={{ width: 44, height: 44, bgcolor: colorBg }}>
            <Icon size={20} color={color} />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── ESG Pillar Card ──────────────────────────────────────────────────────────
function EsgPillarCard({ pilar, score, color, Icon, indicadores }) {
  const grade = score >= 75 ? 'A' : score >= 60 ? 'B' : 'C';
  return (
    <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 36, height: 36, bgcolor: `${color}18` }}>
              <Icon size={18} color={color} />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DARK }}>{pilar}</Typography>
          </Stack>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color, lineHeight: 1 }}>{score}</Typography>
            <Chip label={`Grade ${grade}`} size="small" sx={{ fontSize: '0.65rem', bgcolor: `${color}18`, color, fontWeight: 700, height: 18, mt: 0.25 }} />
          </Box>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={score}
          sx={{
            height: 6, borderRadius: 3, mb: 2,
            bgcolor: 'action.disabledBackground',
            '& .MuiLinearProgress-bar': { bgcolor: color }
          }}
        />
        <Stack spacing={0.75}>
          {indicadores.map(({ nombre, valor, ok }) => (
            <Stack key={nombre} direction="row" justifyContent="space-between" alignItems="center"
              sx={{ px: 1, py: 0.5, borderRadius: 1.5, bgcolor: ok ? '#f0fdf4' : '#fff7ed' }}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                {ok
                  ? <CheckCircle2 size={12} color={TEAL} />
                  : <AlertTriangle size={12} color={AMBER} />}
                <Typography variant="caption" color="text.secondary">{nombre}</Typography>
              </Stack>
              <Typography variant="caption" sx={{ fontWeight: 700, color: ok ? TEAL : AMBER }}>{valor}</Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DashboardMain() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState('mes');

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 600, letterSpacing: 1.5 }}>
            Vista general
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: DARK }}>Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Métricas integradas de huella de carbono, ESG y análisis IA — mayo 2026
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ToggleButtonGroup
            size="small" value={periodo}
            exclusive onChange={(_, v) => v && setPeriodo(v)}
            sx={{ '& .MuiToggleButton-root': { px: 1.75, py: 0.5, fontSize: '0.75rem', fontWeight: 600, textTransform: 'none' } }}
          >
            {['mes','trimestre','año'].map(p => (
              <ToggleButton key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Button size="small" startIcon={<RefreshCw size={14} />} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
            Actualizar
          </Button>
        </Stack>
      </Stack>

      {/* KPI row */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {KPI_CARDS.map(k => (
          <Grid item xs={12} sm={6} md={3} key={k.label}>
            <KpiCard {...k} />
          </Grid>
        ))}
      </Grid>

      {/* Row 2: Emisiones chart + Scope breakdown */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Tendencia emisiones */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DARK }}>Tendencia de emisiones</Typography>
                <Chip label="tCO₂e" size="small" variant="outlined" sx={{ fontSize: '0.68rem' }} />
              </Stack>
              <Typography variant="caption" color="text.secondary">Últimos 7 meses • Datos consolidados Scope 1+2+3</Typography>
              <MiniBarChart data={EMISIONES_MENSUAL} color={TEAL} />
              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">Promedio 6 meses</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>161 tCO₂e</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">Meta anual</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: TEAL }}>120 tCO₂e</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">Proyección</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                    <TrendingDown size={14} color={TEAL} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: TEAL }}>−11%</Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Scope breakdown */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DARK, mb: 0.25 }}>Desglose por Scope</Typography>
              <Typography variant="caption" color="text.secondary">GHG Protocol • Total: 142.3 tCO₂e este mes</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {SCOPE_DATA.map(({ scope, label, value, pct, color, detail }) => (
                  <Box key={scope}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={scope} size="small" sx={{ bgcolor: `${color}18`, color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color, minWidth: 60, textAlign: 'right' }}>
                          {value} t
                        </Typography>
                      </Stack>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct}
                      sx={{ height: 10, borderRadius: 5, bgcolor: 'action.disabledBackground',
                        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 } }} />
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>{detail}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 3: ESG Pillars */}
      <Box sx={{ mb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: DARK }}>Indicadores ESG</Typography>
          <Button size="small" endIcon={<ArrowRight size={14} />} sx={{ textTransform: 'none', color: TEAL }}>
            Ver análisis completo
          </Button>
        </Stack>
        <Grid container spacing={2.5}>
          {ESG_PILLARS.map(p => (
            <Grid item xs={12} md={4} key={p.pilar}>
              <EsgPillarCard {...p} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Row 4: IA Insights + Top proveedores */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Insights IA */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Sparkles size={18} color={TEAL} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DARK }}>Insights de Agentes IA</Typography>
              </Stack>
              <Stack spacing={2}>
                {AI_INSIGHTS.map(({ agente, tipo, color, Icon, mensaje, accion }) => (
                  <Box key={agente} sx={{
                    border: '1px solid', borderColor: `${color}33`,
                    borderLeft: `4px solid ${color}`, borderRadius: 2,
                    p: 1.75, bgcolor: `${color}08`
                  }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      <Icon size={14} color={color} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {agente}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, mb: 1 }}>
                      {mensaje}
                    </Typography>
                    <Button size="small" endIcon={<ArrowRight size={12} />}
                      sx={{ textTransform: 'none', color, p: 0, fontSize: '0.75rem', fontWeight: 700, minWidth: 0 }}>
                      {accion}
                    </Button>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top proveedores */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DARK }}>Top Proveedores por Emisiones</Typography>
                <Chip label="Scope 2 & 3" size="small" variant="outlined" sx={{ fontSize: '0.68rem' }} />
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Proveedor', 'Scope', 'tCO₂e', 'Tendencia', 'Riesgo'].map(h => (
                      <TableCell key={h} sx={{ color: 'text.disabled', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, pb: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {PROVEEDORES_TOP.map(({ nombre, scope, tco2e, riesgo, trend }) => {
                    const rColor = riesgo === 'alto' ? ROSE : riesgo === 'medio' ? AMBER : TEAL;
                    return (
                      <TableRow key={nombre} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ py: 1.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{nombre}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`S${scope}`} size="small"
                            sx={{ fontSize: '0.65rem', height: 20,
                              bgcolor: scope === 3 ? '#ede9fe' : '#dbeafe',
                              color: scope === 3 ? VIOLET : BLUE, fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{tco2e}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {trend > 0
                              ? <TrendingUp size={13} color={ROSE} />
                              : <TrendingDown size={13} color={TEAL} />}
                            <Typography variant="caption" sx={{ color: trend > 0 ? ROSE : TEAL, fontWeight: 700 }}>
                              {trend > 0 ? '+' : ''}{trend}%
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={riesgo} size="small"
                            sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700,
                              bgcolor: `${rColor}18`, color: rColor, textTransform: 'capitalize' }} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Divider sx={{ mt: 1.5, mb: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.disabled">
                  Datos cruzados por Agente Medición Huella CO₂
                </Typography>
                <Button size="small" endIcon={<ArrowRight size={12} />}
                  sx={{ textTransform: 'none', color: TEAL, fontSize: '0.75rem', fontWeight: 700 }}>
                  Ver cadena de suministro
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 5: Metas + Agentes activos */}
      <Grid container spacing={2.5}>
        {/* Metas de reducción */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Target size={18} color={VIOLET} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DARK }}>Metas de reducción 2026</Typography>
              </Stack>
              {[
                { label: 'Emisiones totales',  meta: 120, actual: 142, unidad: 'tCO₂e', color: TEAL },
                { label: 'Energía renovable',  meta: 70,  actual: 41,  unidad: '%',      color: BLUE },
                { label: 'Residuos cero relleno', meta: 90, actual: 82, unidad: '%',    color: VIOLET },
                { label: 'Score ESG',          meta: 80,  actual: 71,  unidad: 'pts',    color: AMBER }
              ].map(({ label, meta, actual, unidad, color }) => {
                const pct = Math.min(100, Math.round((actual / meta) * 100));
                const ok  = actual <= meta || unidad !== 'tCO₂e' ? actual >= meta : false;
                return (
                  <Box key={label} sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {actual} {unidad} / Meta {meta} {unidad}
                        </Typography>
                        {ok
                          ? <CheckCircle2 size={14} color={TEAL} />
                          : <AlertTriangle size={14} color={AMBER} />}
                      </Stack>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct}
                      sx={{ height: 8, borderRadius: 4, bgcolor: 'action.disabledBackground',
                        '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                    <Typography variant="caption" color="text.disabled">{pct}% de la meta alcanzada</Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Estado agentes */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Activity size={18} color={TEAL} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: DARK }}>Estado de Agentes IA</Typography>
                </Stack>
                <Button size="small" endIcon={<ArrowRight size={12} />}
                  onClick={() => navigate('/app/agentes-ia')}
                  sx={{ textTransform: 'none', color: TEAL, fontSize: '0.75rem', fontWeight: 700 }}>
                  Gestionar
                </Button>
              </Stack>
              <Alert severity="warning" icon={<AlertTriangle size={16} />} sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem' }}>
                Ningún agente está activo. Actívalos para comenzar a generar insights automáticos.
              </Alert>
              {[
                { nombre: 'Medición Huella CO₂', color: TEAL,   Icon: Leaf,         ultimo: 'Hoy 08:42',     entregables: 5 },
                { nombre: 'Monitoreo ESG',       color: BLUE,   Icon: BarChart3,     ultimo: 'Ayer 22:15',    entregables: 5 },
                { nombre: 'Reporte ESG',         color: VIOLET, Icon: FileBarChart2, ultimo: '3 días atrás',  entregables: 5 }
              ].map(({ nombre, color, Icon, ultimo, entregables }) => (
                <Stack key={nombre} direction="row" justifyContent="space-between" alignItems="center"
                  sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: `${color}18` }}>
                      <Icon size={15} color={color} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{nombre}</Typography>
                      <Typography variant="caption" color="text.disabled">Última ejecución: {ultimo}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title={`${entregables} entregables disponibles`}>
                      <Chip icon={<FileBarChart2 size={11} />} label={entregables} size="small"
                        sx={{ fontSize: '0.65rem', height: 20, bgcolor: `${color}18`, color }} />
                    </Tooltip>
                    <Chip label="Inactivo" size="small"
                      sx={{ fontSize: '0.65rem', height: 20, bgcolor: 'grey.100', color: 'text.disabled' }} />
                  </Stack>
                </Stack>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
