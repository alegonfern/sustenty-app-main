import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  LinearProgress,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ExpandMore,
  ArrowBack,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Assignment,
  Person,
  CalendarToday,
  Lightbulb,
  Description
} from '@mui/icons-material';
import MainCard from '../../components/MainCard';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

// Componente de Score
function ScoreCircle({ score, size = 120 }) {
  const getColor = (s) => {
    if (s >= 80) return 'success';
    if (s >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={score || 0}
        size={size}
        thickness={4}
        color={getColor(score)}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4">{score ? `${Math.round(score)}%` : 'N/A'}</Typography>
      </Box>
    </Box>
  );
}

// Configuración de severidad
const SEVERITY_CONFIG = {
  critical: { label: 'Crítico', color: 'error', icon: <ErrorIcon /> },
  high: { label: 'Alto', color: 'warning', icon: <Warning /> },
  medium: { label: 'Medio', color: 'info', icon: <Info /> },
  low: { label: 'Bajo', color: 'success', icon: <CheckCircle /> },
  info: { label: 'Info', color: 'default', icon: <Info /> },
};

// Configuración de estado
const STATUS_CONFIG = {
  compliant: { label: 'Cumple', color: 'success', icon: <CheckCircle /> },
  partial: { label: 'Parcial', color: 'warning', icon: <Warning /> },
  non_compliant: { label: 'No Cumple', color: 'error', icon: <ErrorIcon /> },
  not_applicable: { label: 'No Aplica', color: 'default', icon: <Info /> },
  pending_review: { label: 'Pendiente', color: 'info', icon: <Assignment /> },
};

// Componente de Gap individual
function GapItem({ gap, onResolve, onAssign }) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[gap.status] || STATUS_CONFIG.pending_review;
  const severityConfig = SEVERITY_CONFIG[gap.severity] || SEVERITY_CONFIG.medium;

  return (
    <Accordion 
      expanded={expanded} 
      onChange={() => setExpanded(!expanded)}
      sx={{ 
        mb: 1,
        borderLeft: 4,
        borderColor: `${severityConfig.color}.main`
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
          {statusConfig.icon}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2">
              {gap.requirement_code}: {gap.requirement_name}
            </Typography>
            {gap.confidence_score && (
              <Typography variant="caption" color="text.secondary">
                Confianza IA: {Math.round(gap.confidence_score)}%
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip 
              label={statusConfig.label} 
              color={statusConfig.color} 
              size="small" 
            />
            <Chip 
              label={severityConfig.label} 
              color={severityConfig.color} 
              size="small" 
              variant="outlined"
            />
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {/* Hallazgo */}
          {gap.finding && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Hallazgo
              </Typography>
              <Typography variant="body2">
                {gap.finding}
              </Typography>
            </Grid>
          )}

          {/* Evidencia */}
          {gap.evidence_found && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Evidencia Encontrada
              </Typography>
              <Alert severity="info" icon={<Description />}>
                <Typography variant="body2">
                  {gap.evidence_found}
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Recomendación */}
          {gap.recommendation && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recomendación
              </Typography>
              <Alert severity="warning" icon={<Lightbulb />}>
                <Typography variant="body2">
                  {gap.recommendation}
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Acciones */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {gap.status !== 'compliant' && (
                <>
                  <Button
                    size="small"
                    startIcon={<Person />}
                    onClick={() => onAssign(gap)}
                  >
                    Asignar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => onResolve(gap)}
                  >
                    Marcar Resuelto
                  </Button>
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.getComplianceAnalysis(id);
      setAnalysis(response.data);
    } catch (err) {
      console.error('Error cargando análisis:', err);
      toast.error('Error al cargar el análisis');
      navigate('/compliance/analyses');
    } finally {
      setLoading(false);
    }
  };

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
      loadAnalysis();
    } catch (err) {
      console.error('Error resolviendo gap:', err);
      toast.error('Error al resolver la brecha');
    }
  };

  const handleAssign = (gap) => {
    // TODO: Implementar diálogo de asignación
    toast.info('Funcionalidad de asignación próximamente');
  };

  const filteredGaps = analysis?.gaps?.filter(gap => {
    if (filterStatus === 'all') return true;
    return gap.status === filterStatus;
  }) || [];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analysis) {
    return (
      <Alert severity="error">
        Análisis no encontrado
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/compliance/analyses')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4">
            {analysis.name}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={analysis.framework_name} size="small" />
            <Chip 
              label={analysis.status} 
              color={analysis.status === 'completed' ? 'success' : 'default'}
              size="small" 
            />
          </Stack>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Score y Resumen */}
        <Grid item xs={12} md={4}>
          <MainCard>
            <Stack alignItems="center" spacing={2}>
              <Typography variant="h6">Puntuación de Cumplimiento</Typography>
              <ScoreCircle score={analysis.compliance_score} />
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={4}>
                  <Stack alignItems="center">
                    <Typography variant="h5" color="success.main">
                      {analysis.requirements_compliant}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cumple
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack alignItems="center">
                    <Typography variant="h5" color="warning.main">
                      {analysis.requirements_partial}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Parcial
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={4}>
                  <Stack alignItems="center">
                    <Typography variant="h5" color="error.main">
                      {analysis.requirements_non_compliant}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      No Cumple
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </MainCard>

          {/* Información */}
          <MainCard sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Información</Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Framework:</Typography>
                <Typography variant="body2">{analysis.framework_code}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Creado:</Typography>
                <Typography variant="body2">
                  {new Date(analysis.created_at).toLocaleDateString()}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Completado:</Typography>
                <Typography variant="body2">
                  {analysis.completed_at ? new Date(analysis.completed_at).toLocaleDateString() : 'N/A'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Requisitos:</Typography>
                <Typography variant="body2">{analysis.requirements_total}</Typography>
              </Stack>
            </Stack>
          </MainCard>
        </Grid>

        {/* Resumen Ejecutivo y Gaps */}
        <Grid item xs={12} md={8}>
          {/* Resumen Ejecutivo */}
          {analysis.executive_summary && (
            <MainCard sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Resumen Ejecutivo</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {analysis.executive_summary}
              </Typography>
            </MainCard>
          )}

          {/* Hallazgos Clave */}
          {analysis.key_findings?.length > 0 && (
            <MainCard sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Hallazgos Clave</Typography>
              <Stack spacing={1}>
                {analysis.key_findings.map((finding, index) => (
                  <Alert 
                    key={index} 
                    severity={finding.severity === 'critical' ? 'error' : 'warning'}
                  >
                    {finding.finding}
                  </Alert>
                ))}
              </Stack>
            </MainCard>
          )}

          {/* Recomendaciones */}
          {analysis.recommendations?.length > 0 && (
            <MainCard sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Recomendaciones</Typography>
              <Stack spacing={1}>
                {analysis.recommendations.map((rec, index) => (
                  <Alert key={index} severity="info" icon={<Lightbulb />}>
                    {rec}
                  </Alert>
                ))}
              </Stack>
            </MainCard>
          )}

          {/* Lista de Gaps */}
          <MainCard>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Detalle de Requisitos ({filteredGaps.length})
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filtrar</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filtrar"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="compliant">Cumple</MenuItem>
                  <MenuItem value="partial">Parcial</MenuItem>
                  <MenuItem value="non_compliant">No Cumple</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {filteredGaps.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No hay requisitos con el filtro seleccionado
              </Typography>
            ) : (
              filteredGaps.map((gap) => (
                <GapItem
                  key={gap.id}
                  gap={gap}
                  onResolve={handleResolve}
                  onAssign={handleAssign}
                />
              ))
            )}
          </MainCard>
        </Grid>
      </Grid>

      {/* Dialog Resolver */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Marcar como Resuelto</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Requisito: {selectedGap?.requirement_code} - {selectedGap?.requirement_name}
          </Typography>
          <TextField
            label="Notas de resolución"
            fullWidth
            multiline
            rows={3}
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            placeholder="Describe qué acciones se tomaron para resolver esta brecha..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained" color="success" onClick={confirmResolve}>
            Confirmar Resolución
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
