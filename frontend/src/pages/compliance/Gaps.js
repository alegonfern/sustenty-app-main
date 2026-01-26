import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Assignment,
  Person,
  FilterList,
  Visibility,
  Refresh
} from '@mui/icons-material';
import MainCard from '../../components/MainCard';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import InfoTooltip from '../../components/InfoTooltip';

// Configuración de severidad
const SEVERITY_CONFIG = {
  critical: { label: 'Crítico', color: 'error', icon: <ErrorIcon fontSize="small" /> },
  high: { label: 'Alto', color: 'warning', icon: <Warning fontSize="small" /> },
  medium: { label: 'Medio', color: 'info', icon: <Info fontSize="small" /> },
  low: { label: 'Bajo', color: 'success', icon: <CheckCircle fontSize="small" /> },
  info: { label: 'Info', color: 'default', icon: <Info fontSize="small" /> },
};

// Configuración de estado
const STATUS_CONFIG = {
  compliant: { label: 'Cumple', color: 'success' },
  partial: { label: 'Parcial', color: 'warning' },
  non_compliant: { label: 'No Cumple', color: 'error' },
  not_applicable: { label: 'No Aplica', color: 'default' },
  pending_review: { label: 'Pendiente', color: 'info' },
};

// Tarjeta de métrica
function MetricCard({ title, value, icon, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" color={`${color}.main`}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
          </Box>
          <Box sx={{ color: `${color}.main` }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Gaps() {
  const navigate = useNavigate();
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentTab, setCurrentTab] = useState(0);
  
  // Diálogo de resolución
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');
  
  // Diálogo de asignación
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTo, setAssignTo] = useState('');

  useEffect(() => {
    loadGaps();
  }, []);

  const loadGaps = async () => {
    try {
      setLoading(true);
      const response = await api.getComplianceGaps();
      setGaps(response.data.results || response.data);
    } catch (err) {
      console.error('Error cargando gaps:', err);
      toast.error('Error al cargar las brechas');
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas
  const metrics = {
    total: gaps.length,
    critical: gaps.filter(g => g.severity === 'critical').length,
    high: gaps.filter(g => g.severity === 'high').length,
    nonCompliant: gaps.filter(g => g.status === 'non_compliant').length,
    resolved: gaps.filter(g => g.status === 'compliant').length,
  };

  // Filtrar gaps
  const filteredGaps = gaps.filter(gap => {
    // Búsqueda
    const matchesSearch = searchQuery === '' || 
      gap.requirement_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gap.requirement_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gap.finding?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por severidad
    const matchesSeverity = filterSeverity === 'all' || gap.severity === filterSeverity;
    
    // Filtro por estado
    const matchesStatus = filterStatus === 'all' || gap.status === filterStatus;
    
    // Filtro por tab
    let matchesTab = true;
    if (currentTab === 1) matchesTab = gap.status === 'non_compliant';
    if (currentTab === 2) matchesTab = gap.status === 'partial';
    if (currentTab === 3) matchesTab = gap.status === 'compliant';
    
    return matchesSearch && matchesSeverity && matchesStatus && matchesTab;
  });

  const handleResolve = (gap) => {
    setSelectedGap(gap);
    setResolveNotes('');
    setResolveDialogOpen(true);
  };

  const confirmResolve = async () => {
    try {
      await api.resolveGap(selectedGap.id, { notes: resolveNotes });
      toast.success('Brecha marcada como resuelta');
      setResolveDialogOpen(false);
      loadGaps();
    } catch (err) {
      console.error('Error resolviendo gap:', err);
      toast.error('Error al resolver la brecha');
    }
  };

  const handleAssign = (gap) => {
    setSelectedGap(gap);
    setAssignTo('');
    setAssignDialogOpen(true);
  };

  const confirmAssign = async () => {
    try {
      await api.assignGap(selectedGap.id, { assigned_to: assignTo });
      toast.success('Brecha asignada correctamente');
      setAssignDialogOpen(false);
      loadGaps();
    } catch (err) {
      console.error('Error asignando gap:', err);
      toast.error('Error al asignar la brecha');
    }
  };

  const viewAnalysis = (gap) => {
    if (gap.analysis) {
      navigate(`/compliance/analyses/${gap.analysis}`);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4">Brechas de Cumplimiento</Typography>
          <InfoTooltip infoKey="gap" />
        </Stack>
        <Button
          startIcon={<Refresh />}
          onClick={loadGaps}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        ⚠️ <strong>¿Qué son las brechas?</strong> Las brechas son diferencias entre tu situación actual y los requisitos de los 
        marcos normativos. Cada brecha tiene una <strong>severidad</strong> (crítica, alta, media, baja) que indica su urgencia. 
        Resuelve primero las brechas críticas para reducir riesgos regulatorios.
      </Alert>

      {/* Métricas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <MetricCard
            title="Total Brechas"
            value={metrics.total}
            icon={<Assignment sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard
            title="Críticas"
            value={metrics.critical}
            icon={<ErrorIcon sx={{ fontSize: 40 }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard
            title="No Cumplen"
            value={metrics.nonCompliant}
            icon={<Warning sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricCard
            title="Resueltas"
            value={metrics.resolved}
            icon={<CheckCircle sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <MainCard>
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label={`Todas (${gaps.length})`} />
          <Tab label={`No Cumplen (${gaps.filter(g => g.status === 'non_compliant').length})`} />
          <Tab label={`Parciales (${gaps.filter(g => g.status === 'partial').length})`} />
          <Tab label={`Resueltas (${gaps.filter(g => g.status === 'compliant').length})`} />
        </Tabs>

        {/* Filtros */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Buscar por código, nombre o hallazgo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Severidad</InputLabel>
            <Select
              value={filterSeverity}
              label="Severidad"
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="critical">Crítico</MenuItem>
              <MenuItem value="high">Alto</MenuItem>
              <MenuItem value="medium">Medio</MenuItem>
              <MenuItem value="low">Bajo</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Tabla */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredGaps.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No se encontraron brechas con los filtros seleccionados
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Requisito</TableCell>
                  <TableCell>Hallazgo</TableCell>
                  <TableCell align="center">Severidad</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Confianza</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGaps.map((gap) => {
                  const severityConfig = SEVERITY_CONFIG[gap.severity] || SEVERITY_CONFIG.medium;
                  const statusConfig = STATUS_CONFIG[gap.status] || STATUS_CONFIG.pending_review;

                  return (
                    <TableRow key={gap.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {gap.requirement_code}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {gap.requirement_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 300, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {gap.finding || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={severityConfig.icon}
                          label={severityConfig.label}
                          color={severityConfig.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={statusConfig.label}
                          color={statusConfig.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {gap.confidence_score ? (
                          <Typography variant="body2">
                            {Math.round(gap.confidence_score)}%
                          </Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Ver Análisis">
                            <IconButton size="small" onClick={() => viewAnalysis(gap)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {gap.status !== 'compliant' && (
                            <>
                              <Tooltip title="Asignar">
                                <IconButton size="small" onClick={() => handleAssign(gap)}>
                                  <Person fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Resolver">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleResolve(gap)}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      {/* Dialog Resolver */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Marcar Brecha como Resuelta</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Requisito:</strong> {selectedGap?.requirement_code} - {selectedGap?.requirement_name}
          </Alert>
          <TextField
            label="Notas de resolución"
            fullWidth
            multiline
            rows={4}
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            placeholder="Describe qué acciones se tomaron para resolver esta brecha..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={confirmResolve}>
            Confirmar Resolución
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Asignar */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar Responsable</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Requisito:</strong> {selectedGap?.requirement_code} - {selectedGap?.requirement_name}
          </Alert>
          <TextField
            label="Asignar a"
            fullWidth
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            placeholder="Nombre o email del responsable"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmAssign} disabled={!assignTo}>
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
