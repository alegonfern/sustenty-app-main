class DocumentExtractorService:
    """
    Servicio para extraer texto de documentos (PDF, DOCX, etc.)
    """

class DocumentExtractorService:
    """
    Servicio para extraer texto de documentos (PDF, DOCX, etc.)
    """

    def classify_document_type_ia(self, text: str) -> str:
        """
        Clasifica el tipo de documento usando IA (OpenAI) o reglas simples como fallback.
        """
        # --- IA con OpenAI ---
        openai_api_key = getattr(settings, 'OPENAI_API_KEY', os.environ.get('OPENAI_API_KEY'))
        if openai_api_key:
            try:
                import openai
                openai.api_key = openai_api_key
                prompt = (
                    """Clasifica el siguiente documento en una de estas categorías: 
                    - invoice (Factura)
                    - policy (Política)
                    - procedure (Procedimiento)
                    - manual (Manual)
                    - record (Registro)
                    - certificate (Certificado)
                    - audit_report (Informe de Auditoría)
                    - evidence (Evidencia)
                    - contract (Contrato)
                    - training (Material de Capacitación)
                    - other (Otro)
                    Responde solo con la categoría (en inglés, sin explicación):\n\n""" + text[:2000])
                response = openai.Completion.create(
                    engine='gpt-3.5-turbo-instruct',
                    prompt=prompt,
                    max_tokens=5,
                    temperature=0
                )
                tipo = response.choices[0].text.strip().lower()
                valid_types = [
                    'invoice', 'policy', 'procedure', 'manual', 'record', 'certificate',
                    'audit_report', 'evidence', 'contract', 'training', 'other'
                ]
                for vt in valid_types:
                    if vt in tipo:
                        return vt
                return 'other'
            except Exception as e:
                logger.error(f"Error clasificando tipo de documento con OpenAI: {e}")
        # --- Fallback a reglas simples ---
        t = text.lower()
        if any(w in t for w in ['factura', 'invoice', 'rfc', 'subtotal', 'iva']):
            return 'invoice'
        if any(w in t for w in ['contrato', 'contract']):
            return 'contract'
        if any(w in t for w in ['política', 'policy']):
            return 'policy'
        if any(w in t for w in ['procedimiento', 'procedure']):
            return 'procedure'
        if any(w in t for w in ['manual']):
            return 'manual'
        if any(w in t for w in ['registro', 'record']):
            return 'record'
        if any(w in t for w in ['certificado', 'certificate']):
            return 'certificate'
        if any(w in t for w in ['auditoría', 'audit']):
            return 'audit_report'
        if any(w in t for w in ['evidencia', 'evidence']):
            return 'evidence'
        if any(w in t for w in ['capacitaci', 'training']):
            return 'training'
        return 'other'
"""
Servicios para análisis de cumplimiento con IA
"""
import os
import logging
from typing import Optional, Dict, List, Any
from decimal import Decimal, InvalidOperation
import re
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


class DocumentExtractorService:
    """
    Servicio para extraer texto de documentos (PDF, DOCX, etc.)
    """
    
    def extract_text(self, document) -> Optional[str]:
        """
        Extrae texto de un documento
        
        Args:
            document: ComplianceDocument instance
            
        Returns:
            Texto extraído o None si falla
        """
        if not document.file:
            return None
        
        file_path = document.file.path
        file_type = document.file_type or ''
        
        try:
            if 'pdf' in file_type.lower():
                return self._extract_from_pdf(file_path)
            elif 'word' in file_type.lower() or file_path.endswith('.docx'):
                return self._extract_from_docx(file_path)
            elif 'text' in file_type.lower() or file_path.endswith('.txt'):
                return self._extract_from_text(file_path)
            else:
                logger.warning(f"Tipo de archivo no soportado: {file_type}")
                return None
        except Exception as e:
            logger.error(f"Error extrayendo texto de {file_path}: {e}")
            raise

    def _extract_from_pdf(self, file_path: str) -> str:
        """Extrae texto de PDF usando PyPDF2 o pdfplumber"""
        try:
            import pdfplumber
            text_parts = []
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
            return '\n\n'.join(text_parts)
        except ImportError:
            # Fallback a PyPDF2
            try:
                import PyPDF2
                text_parts = []
                with open(file_path, 'rb') as file:
                    reader = PyPDF2.PdfReader(file)
                    for page in reader.pages:
                        text = page.extract_text()
                        if text:
                            text_parts.append(text)
                return '\n\n'.join(text_parts)
            except ImportError:
                logger.error("Ni pdfplumber ni PyPDF2 están instalados")
                raise ImportError("Instala pdfplumber o PyPDF2 para procesar PDFs")

    def _extract_from_docx(self, file_path: str) -> str:
        """Extrae texto de DOCX"""
        try:
            import docx
            doc = docx.Document(file_path)
            return '\n\n'.join([para.text for para in doc.paragraphs if para.text.strip()])
        except ImportError:
            raise ImportError("Instala python-docx para procesar archivos Word")

    def _extract_from_text(self, file_path: str) -> str:
        """Lee archivo de texto plano"""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    def extract_text_async(self, document_id: str):
        """
        Inicia extracción de texto en background
        TODO: Implementar con Celery para procesamiento asíncrono
        """
        from .models import ComplianceDocument
        
        try:
            document = ComplianceDocument.objects.get(id=document_id)
            document.analysis_status = 'processing'
            document.save()
            
            text = self.extract_text(document)
            

            document.extracted_text = text
            document.extraction_date = timezone.now()
            # --- Clasificación automática IA del tipo de documento ---
            if text:
                tipo_detectado = self.classify_document_type_ia(text)
                document.document_type = tipo_detectado
            document.analysis_status = 'completed' if text else 'failed'
            document.save()

            if text and document.document_type == 'invoice':
                try:
                    processor = InvoiceCarbonProcessorService()
                    processor.process_document(document)
                except Exception as invoice_error:
                    logger.error(f"Error procesando factura {document.id}: {invoice_error}")
                    document.analysis_error = str(invoice_error)
                    document.save(update_fields=['analysis_error', 'updated_at'])
            
        except Exception as e:
            logger.error(f"Error en extracción async: {e}")
            try:
                document = ComplianceDocument.objects.get(id=document_id)
                document.analysis_status = 'failed'
                document.analysis_error = str(e)
                document.save()
            except:
                pass


class InvoiceCarbonProcessorService:
    CATEGORY_TO_FACTOR_CODES = {
        'electricity': ['GRID_ELECTRICITY'],
        'diesel': ['DIESEL_COMBUSTION'],
        'gasoline': ['GASOLINE_COMBUSTION'],
        'natural_gas': ['NATURAL_GAS'],
        'freight': ['FREIGHT_TRANSPORT'],
        'flight': ['BUSINESS_FLIGHT'],
        'transport': ['TAXI_TRANSPORT', 'BUS_TRANSPORT'],
        'waste': ['WASTE_LANDFILL'],
    }

    def process_document(self, document) -> Dict[str, Any]:
        from apps.carbon.models import CarbonDataEntry

        if document.document_type != 'invoice':
            raise ValueError('Solo se pueden procesar documentos de tipo factura')

        if not document.extracted_text:
            raise ValueError('La factura no tiene texto extraído')

        extracted_data = self._extract_invoice_data(document.extracted_text, document.name)
        factor = self._resolve_emission_factor(document.organization, extracted_data['category'])
        if not factor:
            raise ValueError('No se encontró un factor de emisión para la categoría detectada')

        quantity = self._resolve_quantity(extracted_data, factor)
        if quantity is None or quantity <= 0:
            raise ValueError('No se pudo determinar una cantidad válida para calcular la huella')

        period = self._resolve_period(document.organization, extracted_data['issue_date'], document.uploaded_by)
        collection_date = extracted_data['issue_date']

        notes = (
            f"Registro automático desde factura {document.name}. "
            f"Proveedor: {extracted_data.get('supplier') or 'No detectado'}. "
            f"Monto: {extracted_data.get('amount_total') or 'No detectado'}."
        )

        entry, created = CarbonDataEntry.objects.get_or_create(
            period=period,
            factor=factor,
            collection_date=collection_date,
            defaults={
                'quantity': quantity,
                'value_numeric': quantity,
                'status': 'completed',
                'responsible': document.uploaded_by,
                'notes': notes,
                'organization': document.organization,
                'created_by': document.uploaded_by,
            }
        )

        if not created:
            entry.quantity = (entry.quantity or Decimal('0')) + quantity
            entry.value_numeric = entry.quantity
            existing_notes = entry.notes or ''
            if notes not in existing_notes:
                entry.notes = f"{existing_notes}\n{notes}".strip()
            if document.uploaded_by and not entry.responsible:
                entry.responsible = document.uploaded_by
            if document.organization and not entry.organization:
                entry.organization = document.organization
            entry.status = 'completed'
            entry.save()

        extracted_data['resolved_factor_code'] = factor.code
        extracted_data['resolved_factor_name'] = factor.name
        extracted_data['resolved_quantity'] = str(quantity)
        extracted_data['carbon_entry_id'] = entry.id
        extracted_data['processed_at'] = timezone.now().isoformat()

        document.extracted_metadata = self._serialize_metadata(extracted_data)
        document.carbon_entry = entry
        document.analysis_error = None
        document.save(update_fields=['extracted_metadata', 'carbon_entry', 'analysis_error', 'updated_at'])

        return {
            'carbon_entry_id': entry.id,
            'created': created,
            'factor': factor.code,
            'quantity': str(quantity),
        }

    def _extract_invoice_data(self, text: str, filename: str) -> Dict[str, Any]:
        content = text or ''
        content_lower = content.lower()

        issue_date = self._extract_date(content) or timezone.now().date()
        amount_total = self._extract_amount(content)
        supplier = self._extract_supplier(content, filename)
        category = self._classify_category(content_lower, filename.lower())

        quantity = self._extract_quantity_for_category(content, category)

        return {
            'supplier': supplier,
            'issue_date': issue_date,
            'amount_total': amount_total,
            'category': category,
            'quantity': quantity,
            'source': 'invoice_repository',
        }

    def _serialize_metadata(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        serialized = {}
        for key, value in payload.items():
            if hasattr(value, 'isoformat'):
                serialized[key] = value.isoformat()
            elif isinstance(value, Decimal):
                serialized[key] = str(value)
            else:
                serialized[key] = value
        return serialized

    def _extract_date(self, text: str):
        date_patterns = [
            r'(?:fecha|emisi[oó]n)\s*[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})',
            r'(\d{2}[\/\-]\d{2}[\/\-]\d{4})',
            r'(\d{4}[\/\-]\d{2}[\/\-]\d{2})',
        ]

        for pattern in date_patterns:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                raw_date = match.group(1)
                for fmt in ('%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%Y/%m/%d'):
                    try:
                        from datetime import datetime
                        return datetime.strptime(raw_date, fmt).date()
                    except ValueError:
                        continue
        return None

    def _extract_amount(self, text: str):
        amount_patterns = [
            r'(?:total|monto\s+total|importe\s+total)\s*[:\-]?\s*[$€]?\s*([\d\.,]+)',
            r'[$€]\s*([\d\.,]+)',
        ]

        for pattern in amount_patterns:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                return self._to_decimal(match.group(1))
        return None

    def _extract_supplier(self, text: str, filename: str) -> str:
        supplier_patterns = [
            r'(?:proveedor|empresa|raz[oó]n\s+social)\s*[:\-]\s*([^\n\r]+)',
        ]

        for pattern in supplier_patterns:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                return match.group(1).strip()[:200]

        cleaned_name = re.sub(r'\.[a-zA-Z0-9]{2,4}$', '', filename)
        return cleaned_name[:200]

    def _classify_category(self, text_lower: str, filename_lower: str) -> str:
        classifier = f"{text_lower}\n{filename_lower}"

        if any(token in classifier for token in ['kwh', 'electricidad', 'energía eléctrica', 'energia electrica']):
            return 'electricity'
        if any(token in classifier for token in ['diésel', 'diesel', 'gasoil']):
            return 'diesel'
        if any(token in classifier for token in ['gasolina', 'bencina']):
            return 'gasoline'
        if any(token in classifier for token in ['gas natural', 'm3 gas', 'm³ gas']):
            return 'natural_gas'
        if any(token in classifier for token in ['flete', 'logística', 'logistica', 'transporte de carga', 'mercancías']):
            return 'freight'
        if any(token in classifier for token in ['vuelo', 'aerolínea', 'aerolinea', 'pasaje aéreo', 'pasaje aereo']):
            return 'flight'
        if any(token in classifier for token in ['uber', 'taxi', 'bus', 'autobús', 'transporte']):
            return 'transport'
        if any(token in classifier for token in ['residuo', 'vertedero', 'basura']):
            return 'waste'
        return 'transport'

    def _extract_quantity_for_category(self, text: str, category: str):
        category_patterns = {
            'electricity': [r'([\d\.,]+)\s*kwh'],
            'diesel': [r'([\d\.,]+)\s*l(?:itros?)?'],
            'gasoline': [r'([\d\.,]+)\s*l(?:itros?)?'],
            'natural_gas': [r'([\d\.,]+)\s*m3', r'([\d\.,]+)\s*m³'],
            'freight': [r'([\d\.,]+)\s*ton(?:eladas?)?'],
            'flight': [r'([\d\.,]+)\s*km'],
            'transport': [r'([\d\.,]+)\s*km'],
            'waste': [r'([\d\.,]+)\s*kg'],
        }

        for pattern in category_patterns.get(category, []):
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                return self._to_decimal(match.group(1))
        return None

    def _resolve_emission_factor(self, organization, category: str):
        from apps.carbon.models import EmissionFactor
        from .models import InvoiceEmissionMapping

        custom_mapping = InvoiceEmissionMapping.objects.filter(
            organization=organization,
            category=category,
            is_active=True,
        ).select_related('emission_factor').first()

        if custom_mapping and custom_mapping.emission_factor and custom_mapping.emission_factor.is_active:
            return custom_mapping.emission_factor

        preferred_codes = self.CATEGORY_TO_FACTOR_CODES.get(category, [])
        if not preferred_codes:
            return None

        by_org = EmissionFactor.objects.filter(
            code__in=preferred_codes,
            is_active=True,
            organization=organization,
        ).order_by('id').first()
        if by_org:
            return by_org

        return EmissionFactor.objects.filter(
            code__in=preferred_codes,
            is_active=True,
            organization__isnull=True,
        ).order_by('id').first()

    def _resolve_period(self, organization, issue_date, user):
        from apps.carbon.models import CarbonPeriod

        period = CarbonPeriod.objects.filter(
            organization=organization,
            is_closed=False,
            start_date__lte=issue_date,
            end_date__gte=issue_date,
        ).order_by('-start_date').first()

        if period:
            return period

        period_name = f"Periodo {issue_date.year}"
        period, _ = CarbonPeriod.objects.get_or_create(
            organization=organization,
            name=period_name,
            defaults={
                'start_date': issue_date.replace(month=1, day=1),
                'end_date': issue_date.replace(month=12, day=31),
                'is_active': True,
                'is_closed': False,
                'description': f'Periodo generado automáticamente desde facturas {issue_date.year}',
                'created_by': user,
            }
        )
        return period

    def _resolve_quantity(self, extracted_data: Dict[str, Any], factor):
        quantity = extracted_data.get('quantity')
        if quantity is not None:
            return quantity

        amount = extracted_data.get('amount_total')
        if amount is not None and factor.unit in ('currency', 'other', 'count'):
            return amount
        return None

    def _to_decimal(self, raw_value: str):
        cleaned = str(raw_value).strip().replace(' ', '')
        if cleaned.count(',') > 0 and cleaned.count('.') > 0:
            cleaned = cleaned.replace('.', '').replace(',', '.')
        elif cleaned.count(',') > 0 and cleaned.count('.') == 0:
            cleaned = cleaned.replace(',', '.')

        try:
            return Decimal(cleaned)
        except (InvalidOperation, ValueError):
            return None


class ComplianceAnalyzerService:
    """
    Servicio para analizar documentos contra frameworks normativos usando IA
    """
    
    def __init__(self):
        self.groq_api_key = getattr(settings, 'GROQ_API_KEY', os.environ.get('GROQ_API_KEY'))
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', os.environ.get('OPENAI_API_KEY'))
    
    def analyze(self, analysis) -> Dict[str, Any]:
        """
        Ejecuta análisis de cumplimiento completo
        
        Args:
            analysis: ComplianceAnalysis instance
            
        Returns:
            Dict con resultados del análisis
        """
        from .models import ComplianceGap
        
        # Obtener documentos y requisitos
        documents = analysis.documents.all()
        framework = analysis.framework
        requirements = framework.requirements.filter(is_active=True)
        
        # Combinar texto de todos los documentos
        combined_text = self._get_combined_document_text(documents)
        
        if not combined_text:
            raise ValueError("No hay texto extraído de los documentos para analizar")
        
        # Analizar cada requisito
        results = []
        for requirement in requirements:
            gap_result = self._analyze_requirement(
                requirement=requirement,
                document_text=combined_text,
                framework=framework
            )
            
            # Crear registro de gap
            gap = ComplianceGap.objects.create(
                analysis=analysis,
                requirement=requirement,
                status=gap_result.get('status', 'pending_review'),
                severity=gap_result.get('severity', 'medium'),
                confidence_score=gap_result.get('confidence', 50),
                finding=gap_result.get('finding'),
                evidence_found=gap_result.get('evidence'),
                recommendation=gap_result.get('recommendation')
            )
            
            results.append(gap_result)
        
        # Generar resumen ejecutivo
        summary = self._generate_executive_summary(analysis, results)
        
        # Calcular score
        total = len(results)
        compliant = sum(1 for r in results if r.get('status') == 'compliant')
        partial = sum(1 for r in results if r.get('status') == 'partial')
        
        compliance_score = ((compliant * 100) + (partial * 50)) / total if total > 0 else 0
        
        return {
            'compliance_score': round(compliance_score, 2),
            'executive_summary': summary.get('executive_summary'),
            'key_findings': summary.get('key_findings', []),
            'recommendations': summary.get('recommendations', []),
            'requirement_results': results
        }
    
    def _get_combined_document_text(self, documents) -> str:
        """Combina el texto extraído de todos los documentos"""
        texts = []
        for doc in documents:
            if doc.extracted_text:
                texts.append(f"=== DOCUMENTO: {doc.name} ===\n{doc.extracted_text}")
        return '\n\n'.join(texts)
    
    def _analyze_requirement(self, requirement, document_text: str, framework) -> Dict[str, Any]:
        """
        Analiza un requisito específico contra el texto del documento
        """
        prompt = f"""Analiza el siguiente texto de documentos de la organización para evaluar el cumplimiento del requisito normativo.

FRAMEWORK: {framework.name} ({framework.code})

REQUISITO A EVALUAR:
- Código: {requirement.code}
- Nombre: {requirement.name}
- Descripción: {requirement.description}
- Criterios de evaluación: {requirement.evaluation_criteria or 'No especificados'}
- Evidencia requerida: {requirement.evidence_required or 'No especificada'}

TEXTO DE LOS DOCUMENTOS:
{document_text[:15000]}  # Limitar para no exceder tokens

INSTRUCCIONES:
1. Evalúa si los documentos proporcionados demuestran cumplimiento con el requisito
2. Busca evidencia específica que soporte o contradiga el cumplimiento
3. Proporciona una recomendación clara si hay brechas

Responde en formato JSON con la siguiente estructura:
{{
    "status": "compliant" | "partial" | "non_compliant" | "not_applicable",
    "severity": "critical" | "high" | "medium" | "low" | "info",
    "confidence": 0-100,
    "finding": "Descripción del hallazgo",
    "evidence": "Evidencia encontrada en los documentos (citas textuales si aplica)",
    "recommendation": "Recomendación para cerrar la brecha (si aplica)"
}}

Solo responde con el JSON, sin texto adicional."""

        try:
            response = self._call_ai_api(prompt)
            return self._parse_ai_response(response)
        except Exception as e:
            logger.error(f"Error analizando requisito {requirement.code}: {e}")
            # Fallback: análisis básico por keywords
            return self._fallback_analysis(requirement, document_text)
    
    def _call_ai_api(self, prompt: str) -> str:
        """Llama a la API de IA (Groq o OpenAI)"""
        
        if self.groq_api_key:
            return self._call_groq(prompt)
        elif self.openai_api_key:
            return self._call_openai(prompt)
        else:
            logger.warning("No hay API key configurada, usando análisis básico")
            raise ValueError("No hay API de IA configurada")
    
    def _call_groq(self, prompt: str) -> str:
        """Llama a la API de Groq"""
        from groq import Groq
        
        client = Groq(api_key=self.groq_api_key)
        
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un experto en cumplimiento normativo y auditoría. Analizas documentos para evaluar el cumplimiento con estándares como ISO, GRI, CSRD, etc. Siempre respondes en JSON válido."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        return response.choices[0].message.content
    
    def _call_openai(self, prompt: str) -> str:
        """Llama a la API de OpenAI"""
        from openai import OpenAI
        
        client = OpenAI(api_key=self.openai_api_key)
        
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {
                    "role": "system",
                    "content": "Eres un experto en cumplimiento normativo y auditoría. Analizas documentos para evaluar el cumplimiento con estándares como ISO, GRI, CSRD, etc. Siempre respondes en JSON válido."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        return response.choices[0].message.content
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parsea la respuesta de la IA"""
        import json
        
        try:
            # Limpiar respuesta
            response = response.strip()
            if response.startswith('```json'):
                response = response[7:]
            if response.startswith('```'):
                response = response[3:]
            if response.endswith('```'):
                response = response[:-3]
            
            return json.loads(response)
        except json.JSONDecodeError as e:
            logger.error(f"Error parseando respuesta IA: {e}")
            return {
                'status': 'pending_review',
                'severity': 'medium',
                'confidence': 0,
                'finding': 'Error al procesar respuesta de IA',
                'evidence': None,
                'recommendation': 'Revisar manualmente'
            }
    
    def _fallback_analysis(self, requirement, document_text: str) -> Dict[str, Any]:
        """
        Análisis básico cuando no hay IA disponible
        Usa keywords para detectar cumplimiento
        """
        keywords = requirement.keywords or []
        text_lower = document_text.lower()
        
        # Buscar keywords en el texto
        found_keywords = [kw for kw in keywords if kw.lower() in text_lower]
        
        # Determinar estado basado en keywords encontrados
        if len(found_keywords) >= len(keywords) * 0.7:
            status = 'compliant'
            severity = 'info'
        elif len(found_keywords) >= len(keywords) * 0.3:
            status = 'partial'
            severity = 'medium'
        else:
            status = 'non_compliant'
            severity = 'high' if requirement.is_mandatory else 'medium'
        
        return {
            'status': status,
            'severity': severity,
            'confidence': 30,  # Baja confianza para análisis básico
            'finding': f"Análisis automático basado en palabras clave. Encontradas: {', '.join(found_keywords) or 'ninguna'}",
            'evidence': None,
            'recommendation': 'Se recomienda revisión manual para validar el cumplimiento.'
        }
    
    def _generate_executive_summary(self, analysis, results: List[Dict]) -> Dict[str, Any]:
        """Genera resumen ejecutivo del análisis"""
        
        total = len(results)
        compliant = sum(1 for r in results if r.get('status') == 'compliant')
        partial = sum(1 for r in results if r.get('status') == 'partial')
        non_compliant = sum(1 for r in results if r.get('status') == 'non_compliant')
        
        critical_gaps = [r for r in results if r.get('severity') == 'critical' and r.get('status') != 'compliant']
        high_gaps = [r for r in results if r.get('severity') == 'high' and r.get('status') != 'compliant']
        
        compliance_score = ((compliant * 100) + (partial * 50)) / total if total > 0 else 0
        
        # Construir resumen
        if compliance_score >= 80:
            overall_status = "excelente"
        elif compliance_score >= 60:
            overall_status = "bueno con áreas de mejora"
        elif compliance_score >= 40:
            overall_status = "moderado, requiere atención"
        else:
            overall_status = "bajo, requiere acción inmediata"
        
        executive_summary = f"""Análisis de cumplimiento para {analysis.framework.name}

RESUMEN:
- Puntuación general: {compliance_score:.1f}% ({overall_status})
- Total de requisitos evaluados: {total}
- Cumplimiento total: {compliant} ({compliant/total*100:.1f}%)
- Cumplimiento parcial: {partial} ({partial/total*100:.1f}%)
- No cumple: {non_compliant} ({non_compliant/total*100:.1f}%)

BRECHAS CRÍTICAS: {len(critical_gaps)}
BRECHAS ALTAS: {len(high_gaps)}

{"⚠️ ATENCIÓN: Se detectaron brechas críticas que requieren acción inmediata." if critical_gaps else "✅ No se detectaron brechas críticas."}
"""
        
        # Hallazgos clave
        key_findings = []
        for gap in critical_gaps[:5]:
            key_findings.append({
                'severity': 'critical',
                'finding': gap.get('finding', 'Brecha crítica detectada')
            })
        for gap in high_gaps[:5]:
            key_findings.append({
                'severity': 'high',
                'finding': gap.get('finding', 'Brecha alta detectada')
            })
        
        # Recomendaciones
        recommendations = []
        for gap in (critical_gaps + high_gaps)[:10]:
            if gap.get('recommendation'):
                recommendations.append(gap.get('recommendation'))
        
        return {
            'executive_summary': executive_summary,
            'key_findings': key_findings,
            'recommendations': list(set(recommendations))  # Eliminar duplicados
        }
