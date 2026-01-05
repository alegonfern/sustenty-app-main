"""
Servicios para análisis de cumplimiento con IA
"""
import os
import logging
from typing import Optional, Dict, List, Any
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
            document.analysis_status = 'completed' if text else 'failed'
            document.save()
            
        except Exception as e:
            logger.error(f"Error en extracción async: {e}")
            try:
                document = ComplianceDocument.objects.get(id=document_id)
                document.analysis_status = 'failed'
                document.analysis_error = str(e)
                document.save()
            except:
                pass


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
