import { Box, Typography, Stack } from '@mui/material';
import DocumentUploader from '../../components/DocumentUploader';

const AI_STAGES = [
  { pct: 8,  msg: 'Leyendo documento...' },
  { pct: 22, msg: 'Extrayendo texto e importes con OCR...' },
  { pct: 38, msg: 'Identificando proveedor, fecha y concepto...' },
  { pct: 52, msg: 'Clasificando gasto por categoría ESG...' },
  { pct: 66, msg: 'Asignando Scope GHG Protocol (1, 2 o 3)...' },
  { pct: 80, msg: 'Calculando emisiones de CO₂e asociadas...' },
  { pct: 92, msg: 'Validando contra normativas CSRD y CNBV...' },
  { pct: 100, msg: '¡Factura procesada exitosamente!' }
];

const ACCEPTED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.xml', '.xlsx', '.csv'];
const ACCEPTED_MIME = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp',
  'text/xml', 'application/xml',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv'
];

export default function Facturas() {
  return (
    <Box>
      <Stack spacing={0.5} sx={{ mb: 4 }}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 600, letterSpacing: 1.5 }}>
          Inventario
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2e29' }}>
          Facturas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sube tus facturas y recibos. La IA extrae datos de emisiones y los clasifica automáticamente por Scope.
        </Typography>
      </Stack>

      <DocumentUploader
        category="Facturas"
        acceptedExts={ACCEPTED_EXTS}
        acceptedMime={ACCEPTED_MIME}
        aiStages={AI_STAGES}
        hint="PDF, imágenes, XML (factura electrónica), Excel o CSV"
      />
    </Box>
  );
}
