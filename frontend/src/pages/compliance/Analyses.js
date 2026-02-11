import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Alert,
  LinearProgress,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Assessment,
  CheckCircle,
  HourglassEmpty,
  Error as ErrorIcon,
  Refresh,
  Policy
} from '@mui/icons-material';
import MainCard from '../../components/MainCard';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import InfoTooltip from '../../components/InfoTooltip';

// Componente de Score
function ScoreDisplay({ score, size = 'medium' }) {
  const getColor = (s) => {
    if (s >= 80) return 'success';
    if (s >= 60) return 'warning';
    return 'error';
  };

  const sizeMap = {
    small: { circle: 60, typography: 'h6' },
    medium: { circle: 100, typography: 'h4' },
    large: { circle: 140, typography: 'h3' }
  };

  const { circle, typography } = sizeMap[size] || sizeMap.medium;

  if (score === null || score === undefined) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: circle }}>
        <Typography color="text.secondary">N/A</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={score}
        size={circle}
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
        <Typography variant={typography}>{Math.round(score)}%</Typography>
      </Box>
    </Box>
  );
}

// Card de Análisis
function AnalysisCard({ analysis, onRun, onView }) {
  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Pendiente', color: 'default', icon: <HourglassEmpty /> },
      running: { label: 'Ejecutando', color: 'info', icon: <Refresh /> },
      completed: { label: 'Completado', color: 'success', icon: <CheckCircle /> },
      failed: { label: 'Error', color: 'error', icon: <ErrorIcon /> },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(analysis.status);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {analysis.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Policy fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {analysis.framework_name}
              </Typography>
            </Stack>
            <Chip
              label={statusConfig.label}
              color={statusConfig.color}
              size="small"
              icon={statusConfig.icon}
            />
          </Box>
          <ScoreDisplay score={analysis.compliance_score} size="small" />
        </Stack>

        {analysis.status === 'completed' && analysis.gaps_summary && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={2}>
              <Typography variant="caption" color="success.main">
                ✓ {analysis.gaps_summary.compliant} cumple
              </Typography>
              <Typography variant="caption" color="warning.main">
                ◐ {analysis.gaps_summary.partial} parcial
              </Typography>
              <Typography variant="caption" color="error.main">
                ✗ {analysis.gaps_summary.non_compliant} no cumple
              </Typography>
            </Stack>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Creado: {new Date(analysis.created_at).toLocaleDateString()}
        </Typography>
      </CardContent>
      <CardActions>
        {analysis.status === 'pending' && (
          <Button
            size="small"
            startIcon={<PlayArrow />}
            onClick={() => onRun(analysis.id)}
            color="primary"
          >
            Ejecutar
          </Button>
        )}
        {analysis.status === 'completed' && (
          <Button
            size="small"
            startIcon={<Assessment />}
            onClick={() => onView(analysis.id)}
          >
            Ver Resultados
          </Button>
        )}
        {analysis.status === 'running' && (
          <Button size="small" disabled startIcon={<CircularProgress size={16} />}>
            Procesando...
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

export default function Analyses() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [running, setRunning] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [newAnalysis, setNewAnalysis] = useState({
    name: '',
    framework: '',
    documents: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analysesRes, frameworksRes, documentsRes] = await Promise.all([
        api.getComplianceAnalyses(),
        api.getComplianceFrameworks(),
        api.getComplianceDocuments()
      ]);
      
      setAnalyses(analysesRes.data.results || analysesRes.data || []);
      setFrameworks(frameworksRes.data.results || frameworksRes.data || []);
      setDocuments((documentsRes.data.results || documentsRes.data || []).filter(
        d => d.analysis_status === 'completed'
      ));
    } catch (err) {
      console.error('Error cargando datos:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnalysis = async () => {
    if (!newAnalysis.name || !newAnalysis.framework || newAnalysis.documents.length === 0) {
      toast.warning('Completa todos los campos requeridos');
      return;
    }

    try {
      setCreating(true);
      await api.createComplianceAnalysis({
        name: newAnalysis.name,
        framework: newAnalysis.framework,
        documents: newAnalysis.documents
      });
      
      toast.success('Análisis creado correctamente');
      setCreateDialogOpen(false);
      setNewAnalysis({ name: '', framework: '', documents: [] });
      loadData();
    } catch (err) {
      console.error('Error creando análisis:', err);
      toast.error('Error al crear análisis');
    } finally {
      setCreating(false);
    }
  };

  const handleRunAnalysis = async (analysisId) => {
    try {
      setRunning(true);
      toast.info('Iniciando análisis con IA... esto puede tardar unos minutos');
      
      await api.runComplianceAnalysis(analysisId);
      
      toast.success('Análisis completado');
      loadData();
    } catch (err) {
      console.error('Error ejecutando análisis:', err);
      toast.error(err.response?.data?.error || 'Error al ejecutar análisis');
      loadData();
    } finally {
      setRunning(false);
    }
  };

  const handleViewAnalysis = (analysisId) => {
    navigate(`/compliance/analyses/${analysisId}`);
  };

  const availableDocuments = documents.filter(d => d.analysis_status === 'completed');

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4" gutterBottom>
              Análisis de Cumplimiento
            </Typography>
            <InfoTooltip infoKey="compliance" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Ejecuta análisis automáticos contra frameworks normativos
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={frameworks.length === 0 || availableDocuments.length === 0}
          >
            Nuevo Análisis
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        🔍 <strong>¿Cómo funciona el análisis?</strong> Selecciona un framework normativo (GRI, SASB, TCFD, etc.) y los documentos 
        a analizar. El sistema evaluará automáticamente tu nivel de cumplimiento e identificará las brechas que debes atender.
      </Alert>

      {/* Instrucciones */}
      {(frameworks.length === 0 || availableDocuments.length === 0) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Para crear un análisis necesitas:
          </Typography>
          <Stepper orientation="vertical" activeStep={frameworks.length > 0 ? 1 : 0}>
            <Step completed={frameworks.length > 0}>
              <StepLabel>Frameworks disponibles ({frameworks.length})</StepLabel>
              <StepContent>
                <Typography variant="body2">
                  Los frameworks normativos (ISO, GRI, etc.) deben estar configurados en el sistema.
                </Typography>
              </StepContent>
            </Step>
            <Step completed={availableDocuments.length > 0}>
              <StepLabel>Documentos procesados ({availableDocuments.length})</StepLabel>
              <StepContent>
                <Typography variant="body2">
                  Sube documentos y asegúrate de que el texto haya sido extraído correctamente.
                </Typography>
                <Button 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/compliance/documents')}
                >
                  Ir a Documentos
                </Button>
              </StepContent>
            </Step>
          </Stepper>
        </Alert>
      )}

      {/* Lista de Análisis */}
      {loading ? (
        <LinearProgress />
      ) : analyses.length === 0 ? (
        <MainCard>
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay análisis realizados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Crea tu primer análisis para evaluar el cumplimiento normativo
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
              disabled={frameworks.length === 0 || availableDocuments.length === 0}
            >
              Nuevo Análisis
            </Button>
          </Box>
        </MainCard>
      ) : (
        <Grid container spacing={3}>
          {analyses.map((analysis) => (
            <Grid item xs={12} sm={6} md={4} key={analysis.id}>
              <AnalysisCard
                analysis={analysis}
                onRun={handleRunAnalysis}
                onView={handleViewAnalysis}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Crear Análisis */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Análisis de Cumplimiento</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del análisis"
              fullWidth
              value={newAnalysis.name}
              onChange={(e) => setNewAnalysis(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Análisis ISO 27001 Q1 2026"
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Framework normativo</InputLabel>
              <Select
                value={newAnalysis.framework}
                label="Framework normativo"
                onChange={(e) => setNewAnalysis(prev => ({ ...prev, framework: e.target.value }))}
              >
                {frameworks.map((fw) => (
                  <MenuItem key={fw.id} value={fw.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography>{fw.name}</Typography>
                      <Chip label={fw.code} size="small" variant="outlined" />
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Documentos a analizar</InputLabel>
              <Select
                multiple
                value={newAnalysis.documents}
                onChange={(e) => setNewAnalysis(prev => ({ ...prev, documents: e.target.value }))}
                input={<OutlinedInput label="Documentos a analizar" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const doc = documents.find(d => d.id === id);
                      return <Chip key={id} label={doc?.name || id} size="small" />;
                    })}
                  </Box>
                )}
              >
                {availableDocuments.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    <Checkbox checked={newAnalysis.documents.includes(doc.id)} />
                    <ListItemText primary={doc.name} secondary={doc.document_type} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Alert severity="info">
              El análisis utilizará IA para evaluar los documentos contra los requisitos del framework seleccionado. 
              Este proceso puede tardar varios minutos dependiendo de la cantidad de documentos y requisitos.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={creating}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateAnalysis}
            disabled={creating || !newAnalysis.name || !newAnalysis.framework || newAnalysis.documents.length === 0}
            startIcon={creating ? <CircularProgress size={16} /> : <Add />}
          >
            {creating ? 'Creando...' : 'Crear Análisis'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
