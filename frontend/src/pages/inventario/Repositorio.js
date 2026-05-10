import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Divider
} from '@mui/material';
import {
  FileText,
  Receipt,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Cpu,
  Sparkles,
  FolderOpen
} from 'lucide-react';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv'
];

const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.xls', '.xlsx', '.csv'];

const AI_STAGES = [
  { pct: 8,  msg: 'Leyendo documento...' },
  { pct: 22, msg: 'Extrayendo texto con OCR...' },
  { pct: 38, msg: 'Identificando estructura de datos...' },
  { pct: 54, msg: 'Clasificando por categoría ESG...' },
  { pct: 68, msg: 'Validando contra normativas CSRD / GHG Protocol...' },
  { pct: 81, msg: 'Cruzando proveedores con base de datos...' },
  { pct: 92, msg: 'Calculando emisiones asociadas...' },
  { pct: 100, msg: '¡Procesado exitosamente!' }
];

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return <FileText size={20} color="#6366f1" />;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileText size={20} color="#10b981" />;
  return <Receipt size={20} color="#f59e0b" />;
}

function ProcessingCard({ file, onRemove }) {
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);

  const start = useCallback(() => {
    if (started) return;
    setStarted(true);
    let s = 0;
    const advance = () => {
      s += 1;
      setStage(s);
      if (s < AI_STAGES.length - 1) {
        const delay = 400 + Math.random() * 600;
        setTimeout(advance, delay);
      } else {
        setDone(true);
      }
    };
    setTimeout(advance, 300);
  }, [started]);

  // Auto-start on mount
  useState(() => { start(); });

  const current = AI_STAGES[Math.min(stage, AI_STAGES.length - 1)];

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: done ? 'success.main' : 'primary.light',
        borderWidth: done ? 1.5 : 1,
        transition: 'border-color 0.4s'
      }}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ mt: 0.5 }}>{fileIcon(file.name)}</Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, maxWidth: '70%' }}>
                {file.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={humanSize(file.size)}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
                {done ? (
                  <Chip
                    icon={<CheckCircle2 size={12} />}
                    label="Procesado"
                    size="small"
                    color="success"
                  />
                ) : (
                  <Chip
                    icon={<Cpu size={12} />}
                    label="Procesando IA"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                <IconButton size="small" onClick={() => onRemove(file.name)} sx={{ color: 'text.secondary' }}>
                  <Trash2 size={14} />
                </IconButton>
              </Stack>
            </Stack>

            {/* Barra de progreso */}
            <LinearProgress
              variant="determinate"
              value={current.pct}
              color={done ? 'success' : 'primary'}
              sx={{
                height: 6,
                borderRadius: 3,
                mb: 0.75,
                bgcolor: 'action.disabledBackground',
                '& .MuiLinearProgress-bar': {
                  transition: 'transform 0.6s ease'
                }
              }}
            />

            {/* Mensaje de etapa */}
            <Stack direction="row" spacing={0.75} alignItems="center">
              {done ? (
                <CheckCircle2 size={13} color="#10b981" />
              ) : (
                <Sparkles size={13} color="#10b981" />
              )}
              <Typography variant="caption" color={done ? 'success.main' : 'text.secondary'} sx={{ fontStyle: done ? 'normal' : 'italic' }}>
                {current.msg}
              </Typography>
              {!done && (
                <Typography variant="caption" color="text.disabled">
                  — {current.pct}%
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Repositorio() {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const addFiles = (newFiles) => {
    setError('');
    const valid = [];
    const invalid = [];

    Array.from(newFiles).forEach((f) => {
      if (ALLOWED_TYPES.includes(f.type) || ALLOWED_EXT.some(ext => f.name.toLowerCase().endsWith(ext))) {
        if (!files.find(existing => existing.name === f.name)) {
          valid.push(f);
        }
      } else {
        invalid.push(f.name);
      }
    });

    if (invalid.length) {
      setError(`Formato no soportado: ${invalid.join(', ')}. Solo PDF, imágenes y hojas de cálculo.`);
    }
    if (valid.length) {
      setFiles(prev => [...prev, ...valid]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  return (
    <Box>
      {/* Header */}
      <Stack spacing={0.5} sx={{ mb: 4 }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 600, letterSpacing: 1.5 }}>
          Inventario
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2e29' }}>
          Repositorio de Facturas y Documentos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sube tus facturas, recibos y documentos. La IA los procesa automáticamente para extraer datos ESG.
        </Typography>
      </Stack>

      {/* Uploader */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: dragging ? 'primary.main' : 'divider',
          borderRadius: 3,
          py: 7,
          px: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragging ? 'primary.lighter' : 'background.paper',
          transition: 'all 0.2s',
          mb: 3,
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.lighter'
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_EXT.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
        />
        <Stack alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Upload size={28} color="#10b981" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {dragging ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              o haz clic para seleccionar desde tu equipo
            </Typography>
          </Box>
          <Button variant="outlined" size="small" sx={{ borderRadius: 2, pointerEvents: 'none' }}>
            Seleccionar archivos
          </Button>
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
            {['PDF', 'JPG / PNG', 'XLSX', 'CSV'].map(f => (
              <Chip key={f} label={f} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            ))}
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" icon={<AlertCircle size={18} />} sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Info box */}
      {files.length === 0 && (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Sparkles size={22} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  ¿Cómo funciona el procesamiento IA?
                </Typography>
                <List dense disablePadding>
                  {[
                    'Lee y extrae texto de PDFs e imágenes con OCR',
                    'Identifica proveedores, montos, fechas y categorías',
                    'Clasifica cada gasto según el estándar GHG Protocol (Scope 1, 2 y 3)',
                    'Calcula automáticamente las emisiones de CO₂e asociadas',
                    'Valida el documento contra normativas CSRD y CNBV'
                  ].map((step, i) => (
                    <ListItem key={i} sx={{ py: 0.25, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {i + 1}.
                        </Typography>
                      </ListItemIcon>
                      <ListItemText primary={<Typography variant="body2">{step}</Typography>} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Cola de archivos */}
      {files.length > 0 && (
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FolderOpen size={20} color="#10b981" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Documentos ({files.length})
              </Typography>
            </Stack>
            <Button
              size="small"
              color="error"
              startIcon={<Trash2 size={14} />}
              onClick={() => setFiles([])}
              sx={{ borderRadius: 1.5 }}
            >
              Limpiar todo
            </Button>
          </Stack>

          <Stack spacing={1.5}>
            {files.map((file) => (
              <ProcessingCard key={file.name} file={file} onRemove={handleRemove} />
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Alert severity="info" icon={<Sparkles size={16} />} sx={{ borderRadius: 2 }}>
            Los datos extraídos quedarán disponibles en el módulo de <strong>Huella de Carbono → Registro</strong> para su revisión y validación.
          </Alert>
        </Box>
      )}
    </Box>
  );
}
