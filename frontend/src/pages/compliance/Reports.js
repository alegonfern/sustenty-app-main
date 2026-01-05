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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Download,
  Delete,
  Visibility,
  Assessment,
  PictureAsPdf,
  TableChart,
  Description,
  Refresh,
  CalendarToday
} from '@mui/icons-material';
import MainCard from '../../components/MainCard';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import InfoTooltip from '../../components/InfoTooltip';

// Tipos de reporte
const REPORT_TYPES = [
  { value: 'summary', label: 'Resumen Ejecutivo', description: 'Resumen de alto nivel del estado de cumplimiento', icon: <Assessment /> },
  { value: 'detailed', label: 'Análisis Detallado', description: 'Análisis completo con todos los requisitos y brechas', icon: <Description /> },
  { value: 'gaps', label: 'Informe de Brechas', description: 'Lista de brechas con recomendaciones de remediación', icon: <TableChart /> },
  { value: 'audit', label: 'Informe de Auditoría', description: 'Reporte formal para auditorías externas', icon: <PictureAsPdf /> },
];

// Formatos de exportación
const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', icon: <PictureAsPdf /> },
  { value: 'xlsx', label: 'Excel', icon: <TableChart /> },
  { value: 'docx', label: 'Word', icon: <Description /> },
];

// Estado del reporte
const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'warning' },
  generating: { label: 'Generando', color: 'info' },
  completed: { label: 'Completado', color: 'success' },
  failed: { label: 'Error', color: 'error' },
};

// Tarjeta de estadísticas
function StatCard({ title, value, icon, color = 'primary' }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" color={`${color}.main`}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
          </Box>
          <Box sx={{ color: `${color}.main`, opacity: 0.7 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Diálogo de nuevo reporte
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    report_type: 'summary',
    analysis: '',
    export_format: 'pdf',
    include_recommendations: true,
    include_evidence: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsRes, analysesRes] = await Promise.all([
        api.getComplianceReports(),
        api.getComplianceAnalyses(),
      ]);
      setReports(reportsRes.data.results || reportsRes.data);
      // Solo análisis completados
      const completedAnalyses = (analysesRes.data.results || analysesRes.data)
        .filter(a => a.status === 'completed');
      setAnalyses(completedAnalyses);
    } catch (err) {
      console.error('Error cargando datos:', err);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setNewReport({
      name: '',
      report_type: 'summary',
      analysis: analyses.length > 0 ? analyses[0].id : '',
      export_format: 'pdf',
      include_recommendations: true,
      include_evidence: true,
    });
    setCreateDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!newReport.name || !newReport.analysis) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    try {
      setGenerating(true);
      
      // 1. Crear el reporte
      const createRes = await api.createComplianceReport(newReport);
      const reportId = createRes.data.id;
      
      // 2. Generar el reporte
      await api.generateComplianceReport(reportId);
      
      toast.success('Reporte generado correctamente');
      setCreateDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error creando reporte:', err);
      toast.error('Error al generar el reporte');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    if (!report.file) {
      toast.warning('El archivo del reporte aún no está disponible');
      return;
    }

    try {
      // Abrir URL del archivo
      window.open(report.file, '_blank');
    } catch (err) {
      console.error('Error descargando:', err);
      toast.error('Error al descargar el reporte');
    }
  };

  const handleDelete = async (report) => {
    if (!window.confirm('¿Estás seguro de eliminar este reporte?')) return;

    try {
      await api.deleteComplianceReport(report.id);
      toast.success('Reporte eliminado');
      loadData();
    } catch (err) {
      console.error('Error eliminando:', err);
      toast.error('Error al eliminar el reporte');
    }
  };

  const handleRegenerate = async (report) => {
    try {
      await api.generateComplianceReport(report.id);
      toast.success('Regenerando reporte...');
      loadData();
    } catch (err) {
      console.error('Error regenerando:', err);
      toast.error('Error al regenerar el reporte');
    }
  };

  // Calcular estadísticas
  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === 'completed').length,
    pending: reports.filter(r => r.status === 'pending' || r.status === 'generating').length,
  };

  const getReportTypeLabel = (type) => {
    return REPORT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h4">Reportes de Cumplimiento</Typography>
          <InfoTooltip infoKey="compliance" />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button startIcon={<Refresh />} onClick={loadData} disabled={loading}>
            Actualizar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleCreate}
            disabled={analyses.length === 0}
          >
            Nuevo Reporte
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        📋 <strong>¿Para qué sirven los reportes?</strong> Los reportes formalizan tu progreso de cumplimiento ESG. 
        Puedes generar resúmenes ejecutivos para la dirección, informes detallados para equipos técnicos, 
        o reportes de auditoría para revisores externos. Exporta en PDF o Excel según tus necesidades.
      </Alert>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Total Reportes"
            value={stats.total}
            icon={<Assessment sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Completados"
            value={stats.completed}
            icon={<Description sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="En Proceso"
            value={stats.pending}
            icon={<CalendarToday sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Mensaje si no hay análisis */}
      {analyses.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No hay análisis completados. Primero debes ejecutar un análisis de cumplimiento para poder generar reportes.
          <Button 
            size="small" 
            sx={{ ml: 2 }}
            onClick={() => navigate('/compliance/analyses')}
          >
            Ir a Análisis
          </Button>
        </Alert>
      )}

      {/* Tabla de reportes */}
      <MainCard title="Historial de Reportes">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : reports.length === 0 ? (
          <Alert severity="info">
            No hay reportes generados. Crea tu primer reporte de cumplimiento.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Análisis</TableCell>
                  <TableCell align="center">Formato</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell>Generado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => {
                  const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;

                  return (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{report.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getReportTypeLabel(report.report_type)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {report.analysis_name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={report.export_format?.toUpperCase() || 'PDF'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {report.status === 'generating' ? (
                          <Stack alignItems="center" spacing={0.5}>
                            <CircularProgress size={20} />
                            <Typography variant="caption">Generando...</Typography>
                          </Stack>
                        ) : (
                          <Chip
                            label={statusConfig.label}
                            color={statusConfig.color}
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {report.generated_at 
                            ? new Date(report.generated_at).toLocaleDateString()
                            : '-'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          {report.status === 'completed' && report.file && (
                            <Tooltip title="Descargar">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleDownload(report)}
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(report.status === 'failed' || report.status === 'completed') && (
                            <Tooltip title="Regenerar">
                              <IconButton 
                                size="small"
                                onClick={() => handleRegenerate(report)}
                              >
                                <Refresh fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Eliminar">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(report)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      {/* Dialog Crear Reporte */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => !generating && setCreateDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Generar Nuevo Reporte</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del Reporte"
              fullWidth
              value={newReport.name}
              onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
              placeholder="Ej: Reporte Q1 2024 ISO 27001"
            />

            <FormControl fullWidth>
              <InputLabel>Análisis Base</InputLabel>
              <Select
                value={newReport.analysis}
                label="Análisis Base"
                onChange={(e) => setNewReport({ ...newReport, analysis: e.target.value })}
              >
                {analyses.map((analysis) => (
                  <MenuItem key={analysis.id} value={analysis.id}>
                    {analysis.name} - {analysis.framework_name} ({Math.round(analysis.compliance_score || 0)}%)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tipo de Reporte</InputLabel>
              <Select
                value={newReport.report_type}
                label="Tipo de Reporte"
                onChange={(e) => setNewReport({ ...newReport, report_type: e.target.value })}
              >
                {REPORT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {type.icon}
                      <Box>
                        <Typography variant="body2">{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Formato de Exportación</InputLabel>
              <Select
                value={newReport.export_format}
                label="Formato de Exportación"
                onChange={(e) => setNewReport({ ...newReport, export_format: e.target.value })}
              >
                {EXPORT_FORMATS.map((format) => (
                  <MenuItem key={format.value} value={format.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {format.icon}
                      <Typography>{format.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {generating && (
              <Box>
                <Typography variant="body2" gutterBottom>Generando reporte...</Typography>
                <LinearProgress />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={generating}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateSubmit}
            disabled={generating || !newReport.name || !newReport.analysis}
            startIcon={generating ? <CircularProgress size={16} /> : <Assessment />}
          >
            {generating ? 'Generando...' : 'Generar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
