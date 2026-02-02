import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  IconButton,
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
  Alert,
  LinearProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Visibility,
  Description,
  PictureAsPdf,
  Article,
  TextSnippet,
  Refresh,
  CheckCircle,
  HourglassEmpty,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import MainCard from '../../components/MainCard';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import InfoTooltip from '../../components/InfoTooltip';

const DOCUMENT_TYPES = [
  { value: 'policy', label: 'Política' },
  { value: 'procedure', label: 'Procedimiento' },
  { value: 'manual', label: 'Manual' },
  { value: 'record', label: 'Registro' },
  { value: 'certificate', label: 'Certificado' },
  { value: 'audit_report', label: 'Informe de Auditoría' },
  { value: 'evidence', label: 'Evidencia' },
  { value: 'contract', label: 'Contrato' },
  { value: 'training', label: 'Material de Capacitación' },
  { value: 'other', label: 'Otro' },
];

// Componente de Dropzone
function FileUploadZone({ onUpload, loading }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: loading
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        bgcolor: isDragActive ? 'primary.lighter' : 'grey.50',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'primary.lighter'
        }
      }}
    >
      <input {...getInputProps()} />
      <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      {isDragActive ? (
        <Typography>Suelta el archivo aquí...</Typography>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Arrastra un archivo o haz clic para seleccionar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Soporta PDF, Word (.docx) y texto plano
          </Typography>
        </>
      )}
    </Box>
  );
}

// Ícono según tipo de archivo
function FileIcon({ fileType }) {
  if (fileType?.includes('pdf')) return <PictureAsPdf color="error" />;
  if (fileType?.includes('word') || fileType?.includes('docx')) return <Article color="primary" />;
  if (fileType?.includes('text')) return <TextSnippet color="info" />;
  return <Description />;
}

// Estado del análisis
function AnalysisStatusChip({ status }) {
  const config = {
    pending: { label: 'Pendiente', color: 'default', icon: <HourglassEmpty fontSize="small" /> },
    processing: { label: 'Procesando', color: 'info', icon: <Refresh fontSize="small" /> },
    completed: { label: 'Completado', color: 'success', icon: <CheckCircle fontSize="small" /> },
    failed: { label: 'Error', color: 'error', icon: <ErrorIcon fontSize="small" /> },
  };

  const { label, color, icon } = config[status] || config.pending;

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      icon={icon}
    />
  );
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentForm, setDocumentForm] = useState({
    name: '',
    description: '',
    document_type: 'other'
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.getComplianceDocuments();
      setDocuments(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error cargando documentos:', err);
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setDocumentForm(prev => ({
      ...prev,
      name: file.name.replace(/\.[^/.]+$/, '') // Nombre sin extensión
    }));
    setUploadDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', documentForm.name);
      formData.append('description', documentForm.description);
      formData.append('document_type', documentForm.document_type);

      await api.uploadComplianceDocument(formData);
      
      toast.success('Documento subido correctamente');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setDocumentForm({ name: '', description: '', document_type: 'other' });
      loadDocuments();
    } catch (err) {
      console.error('Error subiendo documento:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || '';
      if (errorMsg.includes('organización') || err.response?.status === 400) {
        toast.error('Debe configurar una organización antes de subir documentos. Vaya a Organizaciones para crear una.');
      } else {
        toast.error('Error al subir el documento: ' + (errorMsg || 'Error desconocido'));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      await api.deleteComplianceDocument(docId);
      toast.success('Documento eliminado');
      loadDocuments();
    } catch (err) {
      console.error('Error eliminando documento:', err);
      toast.error('Error al eliminar documento');
    }
  };

  const handleExtractText = async (docId) => {
    try {
      toast.info('Extrayendo texto del documento...');
      await api.extractDocumentText(docId);
      toast.success('Texto extraído correctamente');
      loadDocuments();
    } catch (err) {
      console.error('Error extrayendo texto:', err);
      toast.error('Error al extraer texto');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4" gutterBottom>
              Documentos
            </Typography>
            <InfoTooltip infoKey="documents" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Sube y gestiona documentos para análisis de cumplimiento
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={loadDocuments}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        📄 <strong>¿Qué documentos subir?</strong> Sube políticas, procedimientos, certificados, informes de auditoría y cualquier 
        evidencia que demuestre tu cumplimiento ESG. El sistema analizará automáticamente estos documentos para identificar 
        tu nivel de cumplimiento con los diferentes marcos regulatorios.
      </Alert>

      {/* Zona de Upload */}
      <MainCard sx={{ mb: 3 }}>
        <FileUploadZone onUpload={handleFileSelect} loading={uploading} />
      </MainCard>

      {/* Lista de Documentos */}
      <MainCard>
        <Typography variant="h6" gutterBottom>
          Documentos Subidos ({documents.length})
        </Typography>

        {loading ? (
          <LinearProgress />
        ) : documents.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Description sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography color="text.secondary">
              No hay documentos subidos. Arrastra archivos arriba para comenzar.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Tamaño</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FileIcon fileType={doc.file_type} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {doc.name}
                          </Typography>
                          {doc.description && (
                            <Typography variant="caption" color="text.secondary">
                              {doc.description.substring(0, 50)}...
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                    <TableCell>
                      <AnalysisStatusChip status={doc.analysis_status} />
                    </TableCell>
                    <TableCell>
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {doc.file_url && (
                          <Tooltip title="Ver documento">
                            <IconButton
                              size="small"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {doc.analysis_status === 'pending' && (
                          <Tooltip title="Extraer texto">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleExtractText(doc.id)}
                            >
                              <TextSnippet fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      {/* Dialog de Upload */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Documento</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {selectedFile && (
              <Alert severity="info">
                Archivo seleccionado: <strong>{selectedFile.name}</strong> ({formatFileSize(selectedFile.size)})
              </Alert>
            )}

            <TextField
              label="Nombre del documento"
              fullWidth
              value={documentForm.name}
              onChange={(e) => setDocumentForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Tipo de documento</InputLabel>
              <Select
                value={documentForm.document_type}
                label="Tipo de documento"
                onChange={(e) => setDocumentForm(prev => ({ ...prev, document_type: e.target.value }))}
              >
                {DOCUMENT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Descripción (opcional)"
              fullWidth
              multiline
              rows={3}
              value={documentForm.description}
              onChange={(e) => setDocumentForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || !documentForm.name}
            startIcon={uploading ? <Refresh /> : <CloudUpload />}
          >
            {uploading ? 'Subiendo...' : 'Subir Documento'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
