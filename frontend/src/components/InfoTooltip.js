import React from 'react';
import { Tooltip, IconButton, Box, Typography, Stack, Chip } from '@mui/material';
import { HelpCircle, Lightbulb, TrendingUp, Award } from 'lucide-react';

/**
 * Componente de tooltip informativo para educar a usuarios sobre sostenibilidad ESG
 * Diseñado para que Sustenty se sienta como un aliado estratégico del negocio
 */

// Diccionario de información contextual sobre sostenibilidad
export const ESG_INFO = {
  // Conceptos generales
  esg: {
    title: '¿Qué es ESG?',
    description: 'ESG significa Environmental (Ambiental), Social y Governance (Gobernanza). Son criterios que miden cómo tu empresa impacta el planeta, las personas y cómo se gobierna éticamente.',
    benefit: 'Las empresas con buen desempeño ESG atraen más inversores, clientes conscientes y talento comprometido.',
    icon: 'award'
  },
  
  // Emisiones y Scopes
  emissions: {
    title: 'Emisiones de CO₂',
    description: 'Las emisiones de gases de efecto invernadero se miden en toneladas de CO₂ equivalente (tCO₂e). Reducirlas es clave para combatir el cambio climático.',
    benefit: 'Reducir emisiones no solo ayuda al planeta, también reduce costos operativos y mejora tu imagen de marca.',
    icon: 'trending'
  },
  scope1: {
    title: 'Scope 1 - Emisiones Directas',
    description: 'Son las emisiones que tu empresa genera directamente: combustión de vehículos propios, calderas, equipos de producción, etc.',
    benefit: 'Tienes control directo sobre estas emisiones. Electrificar tu flota o mejorar equipos puede generar ahorros significativos.',
    icon: 'lightbulb'
  },
  scope2: {
    title: 'Scope 2 - Energía Consumida',
    description: 'Emisiones indirectas por la electricidad, calefacción o refrigeración que compras. Dependen de cómo se genera la energía en tu región.',
    benefit: 'Cambiar a energías renovables o mejorar eficiencia energética reduce costos y posiciona tu marca como sostenible.',
    icon: 'lightbulb'
  },
  scope3: {
    title: 'Scope 3 - Cadena de Valor',
    description: 'Todas las demás emisiones indirectas: proveedores, transporte, uso de productos vendidos, desplazamiento de empleados, etc.',
    benefit: 'Representa hasta el 90% de las emisiones totales. Trabajar con proveedores sostenibles mejora toda tu cadena.',
    icon: 'lightbulb'
  },

  // Categorías ESG
  environmental: {
    title: 'Dimensión Ambiental (E)',
    description: 'Mide el impacto de tu empresa en el medio ambiente: emisiones, uso de recursos, gestión de residuos, biodiversidad.',
    benefit: 'Clientes y consumidores prefieren marcas ambientalmente responsables. Puede abrir acceso a certificaciones y mercados verdes.',
    icon: 'award'
  },
  social: {
    title: 'Dimensión Social (S)',
    description: 'Evalúa cómo tratas a empleados, proveedores y comunidades: condiciones laborales, diversidad, seguridad, impacto social.',
    benefit: 'Empresas con buenas prácticas sociales retienen mejor el talento y construyen reputación sólida.',
    icon: 'award'
  },
  governance: {
    title: 'Dimensión de Gobernanza (G)',
    description: 'Analiza cómo se dirige tu empresa: ética empresarial, transparencia, diversidad en directivos, anticorrupción.',
    benefit: 'Buena gobernanza genera confianza en inversores, socios y reguladores. Reduce riesgos legales y reputacionales.',
    icon: 'award'
  },

  // Factores de emisión
  emissionFactor: {
    title: 'Factores de Emisión',
    description: 'Son valores que convierten una actividad (ej: litros de combustible) en emisiones de CO₂. Sustenty usa factores oficiales y actualizados.',
    benefit: 'Tener factores precisos asegura que tus reportes sean confiables y aceptados por auditores e inversores.',
    icon: 'lightbulb'
  },

  // Períodos
  period: {
    title: 'Períodos de Reporte',
    description: 'Intervalos de tiempo para medir y comparar tu desempeño ESG. Generalmente anuales, pero pueden ser trimestrales.',
    benefit: 'Comparar períodos te permite ver tu progreso y demostrar mejoras continuas a stakeholders.',
    icon: 'trending'
  },

  // Cumplimiento normativo
  compliance: {
    title: 'Cumplimiento Normativo',
    description: 'Verificar que tu empresa cumple con regulaciones ESG aplicables: reportes obligatorios, estándares, certificaciones.',
    benefit: 'El cumplimiento evita multas, abre mercados regulados y demuestra madurez empresarial.',
    icon: 'award'
  },
  framework: {
    title: 'Marcos Normativos',
    description: 'Estándares internacionales como GRI, SASB, TCFD que definen qué y cómo reportar en sostenibilidad.',
    benefit: 'Reportar bajo estándares reconocidos facilita comparaciones con competidores y acceso a fondos ESG.',
    icon: 'lightbulb'
  },
  gap: {
    title: 'Análisis de Brechas',
    description: 'Identifica qué requisitos normativos no cumples actualmente y qué necesitas mejorar.',
    benefit: 'Conocer tus brechas te permite priorizar acciones y asignar recursos eficientemente.',
    icon: 'trending'
  },

  // Acciones
  actions: {
    title: 'Acciones de Mejora',
    description: 'Iniciativas concretas para mejorar tu desempeño ESG: proyectos de eficiencia, cambios de proveedores, políticas nuevas.',
    benefit: 'Las acciones documentadas demuestran compromiso real y permiten medir retorno de inversión.',
    icon: 'trending'
  },

  // Metas
  goals: {
    title: 'Metas ESG',
    description: 'Objetivos cuantificables y con plazo definido: "Reducir 30% emisiones para 2030" o "100% energía renovable para 2025".',
    benefit: 'Las metas claras motivan a tu equipo, atraen inversores y permiten celebrar logros.',
    icon: 'award'
  },

  // Colección de datos
  dataCollection: {
    title: 'Recolección de Datos',
    description: 'Proceso de registrar información ESG de tu empresa: consumos, actividades, evidencias.',
    benefit: 'Datos precisos son la base de decisiones inteligentes y reportes creíbles.',
    icon: 'lightbulb'
  },

  // Organizaciones
  organization: {
    title: 'Gestión de Organizaciones',
    description: 'Sustenty te permite gestionar múltiples empresas, filiales o unidades de negocio desde una sola cuenta.',
    benefit: 'Ideal para grupos empresariales o consultores que asesoran varias empresas.',
    icon: 'award'
  },

  // Equipos
  teams: {
    title: 'Equipos de Trabajo',
    description: 'Agrupa a los colaboradores responsables de gestionar la sostenibilidad en tu empresa.',
    benefit: 'Asignar responsables claros acelera la implementación y asegura accountability.',
    icon: 'lightbulb'
  },

  // Analítica
  analytics: {
    title: 'Analítica ESG',
    description: 'Visualizaciones y reportes que te muestran tendencias, comparativas y áreas de oportunidad.',
    benefit: 'Datos bien presentados facilitan decisiones estratégicas y comunicación con directivos.',
    icon: 'trending'
  },

  // Documentos
  documents: {
    title: 'Gestión Documental',
    description: 'Almacena políticas, evidencias, certificados y reportes relacionados con tu gestión ESG.',
    benefit: 'Tener documentación organizada facilita auditorías y demuestra trazabilidad.',
    icon: 'lightbulb'
  }
};

// Componente de tooltip informativo
export default function InfoTooltip({ 
  infoKey, 
  size = 16, 
  placement = 'top',
  color = 'text.secondary',
  showInline = false 
}) {
  const info = ESG_INFO[infoKey];
  
  if (!info) {
    console.warn(`InfoTooltip: No se encontró información para la clave "${infoKey}"`);
    return null;
  }

  const IconComponent = info.icon === 'lightbulb' ? Lightbulb : 
                        info.icon === 'trending' ? TrendingUp : 
                        info.icon === 'award' ? Award : HelpCircle;

  const tooltipContent = (
    <Box sx={{ p: 1, maxWidth: 320 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconComponent size={18} />
          <Typography variant="subtitle2" fontWeight={600}>
            {info.title}
          </Typography>
        </Stack>
        
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          {info.description}
        </Typography>
        
        <Box 
          sx={{ 
            p: 1.5, 
            bgcolor: 'success.lighter', 
            borderRadius: 1,
            borderLeft: '3px solid',
            borderLeftColor: 'success.main'
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TrendingUp size={16} style={{ marginTop: 2, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 500 }}>
              💡 {info.benefit}
            </Typography>
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
          Sustenty te ayuda a gestionar esto fácilmente
        </Typography>
      </Stack>
    </Box>
  );

  if (showInline) {
    return (
      <Tooltip 
        title={tooltipContent} 
        placement={placement}
        arrow
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: 3,
              '& .MuiTooltip-arrow': {
                color: 'background.paper',
              },
            },
          },
        }}
      >
        <Chip
          icon={<HelpCircle size={14} />}
          label={info.title}
          size="small"
          variant="outlined"
          sx={{ 
            cursor: 'help',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip 
      title={tooltipContent} 
      placement={placement}
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 3,
            '& .MuiTooltip-arrow': {
              color: 'background.paper',
            },
          },
        },
      }}
    >
      <IconButton 
        size="small" 
        sx={{ 
          p: 0.5,
          color: color,
          '&:hover': { 
            color: 'primary.main',
            bgcolor: 'primary.lighter' 
          }
        }}
      >
        <HelpCircle size={size} />
      </IconButton>
    </Tooltip>
  );
}

// Componente para mostrar información en cards destacadas
export function InfoCard({ infoKey, variant = 'outlined' }) {
  const info = ESG_INFO[infoKey];
  
  if (!info) return null;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: variant === 'outlined' ? '1px solid' : 'none',
        borderColor: 'divider',
        bgcolor: variant === 'filled' ? 'grey.50' : 'transparent',
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2" fontWeight={600} color="primary.main">
          💡 {info.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {info.description}
        </Typography>
        <Typography variant="caption" color="success.main" fontWeight={500}>
          ✓ {info.benefit}
        </Typography>
      </Stack>
    </Box>
  );
}

// Componente para barra de información contextual
export function ContextualHelp({ infoKey, children }) {
  const info = ESG_INFO[infoKey];
  
  if (!info) return children;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {children}
      <InfoTooltip infoKey={infoKey} />
    </Stack>
  );
}
