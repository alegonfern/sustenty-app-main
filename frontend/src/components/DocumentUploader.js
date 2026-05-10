/**
 * DocumentUploader — componente reutilizable para subida de documentos con
 * simulación de procesamiento IA. Configurable por categoría de documento.
 *
 * Props:
 *   category     string  — nombre de la categoría (ej. "Facturas")
 *   acceptedExts array   — extensiones permitidas (ej. ['.pdf', '.jpg'])
 *   acceptedMime array   — MIME types permitidos
 *   aiStages     array   — [{pct, msg}] etapas del pipeline IA
 *   hint         string  — texto de ayuda debajo del drop zone
 *   onProcessed  fn(file)— callback cuando un archivo termina de procesarse
 */
import { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
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
  Alert,
  Divider,
  IconButton
} from '@mui/material';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Cpu,
  Sparkles,
  FolderOpen,
  FileText
} from 'lucide-react';

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ProcessingCard({ file, aiStages, onRemove }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [started, setStarted] = useState(false);

  // auto-start on first render
  const startRef = useRef(false);
  if (!startRef.current) {
    startRef.current = true;
    // kick off after paint
    setTimeout(() => {
      setStarted(true);
      let s = 0;
      const advance = () => {
        s += 1;
        setStageIdx(s);
        if (s < aiStages.length - 1) {
          setTimeout(advance, 450 + Math.random() * 550);
        }
      };
      setTimeout(advance, 350);
    }, 0);
  }

  const current = aiStages[Math.min(stageIdx, aiStages.length - 1)];
  const done = stageIdx >= aiStages.length - 1 && started;

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
          <FileText size={20} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Nombre + chips */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, maxWidth: '60%' }}>
                {file.name}
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Chip label={humanSize(file.size)} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                {done ? (
                  <Chip icon={<CheckCircle2 size={12} />} label="Procesado" size="small" color="success" />
                ) : (
                  <Chip icon={<Cpu size={12} />} label="IA procesando" size="small" color="primary" variant="outlined" />
                )}
                <IconButton size="small" onClick={() => onRemove(file.name)} sx={{ color: 'text.secondary' }}>
                  <Trash2 size={14} />
                </IconButton>
              </Stack>
            </Stack>

            {/* Barra */}
            <LinearProgress
              variant="determinate"
              value={current.pct}
              color={done ? 'success' : 'primary'}
              sx={{
                height: 6, borderRadius: 3, mb: 0.75,
                bgcolor: 'action.disabledBackground',
                '& .MuiLinearProgress-bar': { transition: 'transform 0.6s ease' }
              }}
            />

            {/* Mensaje etapa */}
            <Stack direction="row" spacing={0.75} alignItems="center">
              {done
                ? <CheckCircle2 size={13} color="#10b981" />
                : <Sparkles size={13} color="#10b981" />}
              <Typography
                variant="caption"
                color={done ? 'success.main' : 'text.secondary'}
                sx={{ fontStyle: done ? 'normal' : 'italic' }}
              >
                {current.msg}
              </Typography>
              {!done && (
                <Typography variant="caption" color="text.disabled">— {current.pct}%</Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function DocumentUploader({
  category,
  acceptedExts,
  acceptedMime,
  aiStages,
  hint,
  onProcessed
}) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const addFiles = useCallback((newFiles) => {
    setError('');
    const valid = [];
    const invalid = [];

    Array.from(newFiles).forEach((f) => {
      const allowed =
        (acceptedMime && acceptedMime.includes(f.type)) ||
        acceptedExts.some(ext => f.name.toLowerCase().endsWith(ext));
      if (allowed) {
        if (!files.find(ex => ex.name === f.name)) valid.push(f);
      } else {
        invalid.push(f.name);
      }
    });

    if (invalid.length) {
      setError(`Formato no permitido: ${invalid.join(', ')}. Tipos aceptados: ${acceptedExts.join(', ')}.`);
    }
    if (valid.length) {
      setFiles(prev => [...prev, ...valid]);
      valid.forEach(f => onProcessed?.(f));
    }
  }, [files, acceptedExts, acceptedMime, onProcessed]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = (name) => setFiles(prev => prev.filter(f => f.name !== name));

  return (
    <Box>
      {/* Drop zone */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: dragging ? 'primary.main' : 'divider',
          borderRadius: 3,
          py: 7, px: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragging ? 'primary.lighter' : 'background.paper',
          transition: 'all 0.2s',
          mb: 3,
          '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.lighter' }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedExts.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
        />
        <Stack alignItems="center" spacing={2}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'primary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Upload size={28} color="#10b981" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {dragging ? 'Suelta los archivos aquí' : `Arrastra tus ${category.toLowerCase()} aquí`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              o haz clic para seleccionarlos desde tu equipo
            </Typography>
          </Box>
          <Button variant="outlined" size="small" sx={{ borderRadius: 2, pointerEvents: 'none' }}>
            Seleccionar archivos
          </Button>
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
            {acceptedExts.map(ext => (
              <Chip key={ext} label={ext.replace('.', '').toUpperCase()} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            ))}
          </Stack>
          {hint && (
            <Typography variant="caption" color="text.disabled">{hint}</Typography>
          )}
        </Stack>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" icon={<AlertCircle size={18} />} sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Estado vacío — explicación IA */}
      {files.length === 0 && (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Sparkles size={22} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  ¿Cómo procesa la IA tus {category.toLowerCase()}?
                </Typography>
                <List dense disablePadding>
                  {aiStages.slice(0, -1).map((s, i) => (
                    <ListItem key={i} sx={{ py: 0.2, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 26 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{i + 1}.</Typography>
                      </ListItemIcon>
                      <ListItemText primary={<Typography variant="body2">{s.msg}</Typography>} />
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
                {category} ({files.length})
              </Typography>
            </Stack>
            <Button size="small" color="error" startIcon={<Trash2 size={14} />} onClick={() => setFiles([])} sx={{ borderRadius: 1.5 }}>
              Limpiar todo
            </Button>
          </Stack>

          <Stack spacing={1.5}>
            {files.map((file) => (
              <ProcessingCard key={file.name} file={file} aiStages={aiStages} onRemove={handleRemove} />
            ))}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Alert severity="info" icon={<Sparkles size={16} />} sx={{ borderRadius: 2 }}>
            Los datos extraídos quedarán disponibles para revisión y validación.
          </Alert>
        </Box>
      )}
    </Box>
  );
}

DocumentUploader.propTypes = {
  category: PropTypes.string.isRequired,
  acceptedExts: PropTypes.arrayOf(PropTypes.string).isRequired,
  acceptedMime: PropTypes.arrayOf(PropTypes.string),
  aiStages: PropTypes.arrayOf(PropTypes.shape({ pct: PropTypes.number, msg: PropTypes.string })).isRequired,
  hint: PropTypes.string,
  onProcessed: PropTypes.func
};
