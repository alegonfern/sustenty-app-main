import { Box, Typography, Stack, Alert } from '@mui/material';
import { ShieldCheck } from 'lucide-react';
import DocumentUploader from '../../components/DocumentUploader';

const AI_STAGES = [
  { pct: 8,  msg: 'Leyendo documento normativo...' },
  { pct: 20, msg: 'Identificando marco regulatorio (CSRD, GHG, CNBV, ISO 14064...)...' },
  { pct: 35, msg: 'Extrayendo requisitos y obligaciones clave...' },
  { pct: 50, msg: 'Mapeando artículos contra tu perfil de organización...' },
  { pct: 65, msg: 'Detectando brechas de cumplimiento...' },
  { pct: 78, msg: 'Generando checklist de acciones requeridas...' },
  { pct: 90, msg: 'Priorizando por fecha límite y criticidad...' },
  { pct: 100, msg: '¡Normativa incorporada al módulo de Cumplimiento!' }
];

const ACCEPTED_EXTS = ['.pdf', '.docx', '.doc', '.txt', '.xlsx'];
const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export default function Normativas() {
  return (
    <Box>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 600, letterSpacing: 1.5 }}>
          Inventario
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2e29' }}>
          Normativas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sube regulaciones, marcos normativos y estándares. La IA los analiza y alimenta el módulo de Cumplimiento.
        </Typography>
      </Stack>

      <Alert
        severity="info"
        icon={<ShieldCheck size={18} />}
        sx={{ mb: 3, borderRadius: 2 }}
      >
        Los documentos procesados aquí se vincularán automáticamente con <strong>Cumplimiento → Dashboard</strong> para generar análisis de brechas y reportes regulatorios.
      </Alert>

      <DocumentUploader
        category="Normativas"
        acceptedExts={ACCEPTED_EXTS}
        acceptedMime={ACCEPTED_MIME}
        aiStages={AI_STAGES}
        hint="Soporta CSRD, GHG Protocol, ISO 14064, CNBV, taxonomías verdes y más"
      />
    </Box>
  );
}
