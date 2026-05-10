import React, { useState } from 'react';
import './LandingYC.css';

// ── Nav ────────────────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: 'El problema', href: '#problema' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Precio', href: '#precio' },
  ];
  return (
    <>
      <nav className="lyc-nav">
        <a className="lyc-nav-logo" href="/">
          <img src="/logo_saas.png" alt="Sustenty logo" />
          <span>Sustenty</span>
        </a>
        <div className="lyc-nav-links">
          {links.map(l => (
            <a key={l.href} className="lyc-nav-link" href={l.href}>{l.label}</a>
          ))}
          <a className="lyc-nav-login" href="/login">Iniciar sesión</a>
          <a className="lyc-nav-cta" href="#precio">Empieza gratis</a>
        </div>
        <button className="lyc-nav-menu-btn" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {open
              ? <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              : <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            }
          </svg>
        </button>
      </nav>
      {open && (
        <div className="lyc-nav-mobile-drawer">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a href="#precio" onClick={() => setOpen(false)}>Empieza gratis</a>
        </div>
      )}
    </>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="lyc-hero">
      <div className="lyc-hero-inner">
        <div className="lyc-hero-badge">
          <span className="lyc-hero-badge-dot" />
          Regulación CSRD en vigor — ¿tu empresa está lista?
        </div>
        <h1 className="lyc-h1">
          Mide y repara<br />
          tu impacto<br />
          <span className="teal">en el planeta.</span>
        </h1>
        <p className="lyc-hero-sub">
          Sustenty automatiza el cálculo de huella de carbono, genera reportes listos para auditores y te dice exactamente dónde reducir costos energéticos. En horas, no meses.
        </p>
        <div className="lyc-hero-actions">
          <a className="lyc-btn-primary" href="#precio">
            Calcular mi huella gratis →
          </a>
          <a className="lyc-btn-ghost-dark" href="#como-funciona">
            Ver cómo funciona
          </a>
        </div>
        <div className="lyc-hero-stats">
          <div className="lyc-stat">
            <div className="lyc-stat-num">8 h</div>
            <div className="lyc-stat-label">primer reporte listo</div>
          </div>
          <div className="lyc-stat">
            <div className="lyc-stat-num">−70%</div>
            <div className="lyc-stat-label">vs. consultoría tradicional</div>
          </div>
          <div className="lyc-stat">
            <div className="lyc-stat-num">2027</div>
            <div className="lyc-stat-label">fecha límite CSRD Latam</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pain ───────────────────────────────────────────────────────────────
const pains = [
  {
    ico: '📋',
    title: 'Reportar emisiones sin datos',
    desc: 'Excel con facturas, correos a proveedores, meses de trabajo manual. Cada reporte ESG les cuesta entre $15k y $80k en consultoría.',
  },
  {
    ico: '⚖️',
    title: 'Cumplimiento regulatorio urgente',
    desc: 'CSRD, SEC Climate Rules, taxonomía verde de la CNBV. Las multas ya llegaron a Europa y vienen para Latinoamérica en 2025–2027.',
  },
  {
    ico: '📉',
    title: 'Inversionistas y clientes lo exigen',
    desc: 'El 82% de los grandes compradores B2B piden datos de huella de carbono de sus proveedores. Sin eso, pierdes contratos.',
  },
];

function Problem() {
  return (
    <section className="lyc-bg-white" id="problema">
      <div className="lyc-section">
        <div className="lyc-label">El problema real</div>
        <h2 className="lyc-h2-l">
          Medir sostenibilidad hoy<br />
          <span className="red">es caro, lento y opaco.</span>
        </h2>
        <p className="lyc-sub-l">
          Las empresas contratan consultoras que cobran caro, tardan meses y entregan un PDF que nadie sabe ejecutar. El año siguiente vuelven a empezar desde cero.
        </p>
        <div className="lyc-pain-grid">
          {pains.map(p => (
            <div className="lyc-pain-card" key={p.title}>
              <div className="lyc-pain-ico">{p.ico}</div>
              <div className="lyc-pain-title">{p.title}</div>
              <div className="lyc-pain-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Agents ─────────────────────────────────────────────────────────────
const agents = [
  {
    ico: '🔬',
    name: 'Calculador',
    desc: 'Conecta facturas, recibos y datos de proveedores. Calcula automáticamente Scope 1, 2 y 3 con factores de emisión oficiales (GHG Protocol, IPCC).',
  },
  {
    ico: '📑',
    name: 'Reportero',
    desc: 'Genera reportes en formato GRI, ESRS y TCFD listos para auditar. Sin tablas en Excel, sin copiar datos a mano.',
  },
  {
    ico: '💡',
    name: 'Optimizador',
    desc: 'Identifica los proyectos de reducción con mejor ROI: paneles solares, eficiencia energética, cambio de flota. Con números, no con intenciones.',
  },
];

function Agents() {
  return (
    <section className="lyc-bg-dark">
      <div className="lyc-section">
        <div className="lyc-label">Tu equipo ESG virtual</div>
        <h2 className="lyc-h2-d">
          Tres agentes de IA que reemplazan<br />
          <span className="teal">a tu consultora ESG</span>
        </h2>
        <p className="lyc-sub-d">
          Por 1/10 del costo de una consultoría, Sustenty trabaja 24/7: recolecta datos, calcula, reporta y propone acciones concretas.
        </p>
        <div className="lyc-agents-grid">
          {agents.map(a => (
            <div className="lyc-agent-card" key={a.name}>
              <div className="lyc-agent-ico">{a.ico}</div>
              <div className="lyc-agent-name">{a.name}</div>
              <div className="lyc-agent-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it Works ───────────────────────────────────────────────────────
const steps = [
  {
    n: '1',
    title: 'Conecta tus fuentes de datos (30 min)',
    desc: 'Sube facturas de energía, archivos de compras o conecta vía API tu ERP. Sustenty lee, extrae y organiza sin trabajo manual.',
  },
  {
    n: '2',
    title: 'Revisa tu inventario de emisiones (mismo día)',
    desc: 'El Calculador mapea cada dato a la categoría correcta del GHG Protocol. Ves tu huella Scope 1, 2 y 3 desglosada por área o producto.',
  },
  {
    n: '3',
    title: 'Descarga tu reporte listo para auditoría (24 h)',
    desc: 'PDF + Excel estructurado según el estándar que necesites: GRI, ESRS, CDP o personalizado para tu cliente o inversor.',
  },
  {
    n: '4',
    title: 'Ejecuta las mejoras con ROI positivo',
    desc: 'El Optimizador te da un roadmap priorizado: qué cambiar primero, cuánto cuesta, cuánto ahorras y en qué plazo recuperas la inversión.',
  },
];

function HowItWorks() {
  return (
    <section className="lyc-bg-tint" id="como-funciona">
      <div className="lyc-section">
        <div className="lyc-label">Cómo funciona</div>
        <h2 className="lyc-h2-l">
          Activo en horas,<br />
          <span className="teal">no en meses.</span>
        </h2>
        <p className="lyc-sub-l">
          Sin implementaciones largas, sin consultores que piden más información, sin reuniones semanales que no llegan a ningún lado.
        </p>
        <div className="lyc-steps">
          {steps.map(s => (
            <div className="lyc-step" key={s.n}>
              <div className="lyc-step-num">{s.n}</div>
              <div>
                <div className="lyc-step-title">{s.title}</div>
                <div className="lyc-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Urgency ────────────────────────────────────────────────────────────
const urgencies = [
  {
    ico: '🇪🇺',
    title: 'CSRD ya obliga en Europa',
    desc: 'Desde 2024, más de 50,000 empresas europeas reportan obligatoriamente. Sus proveedores latinoamericanos también deben demostrar cumplimiento.',
  },
  {
    ico: '🏦',
    title: 'Financiamiento verde con condiciones ESG',
    desc: 'IFC, BID y grandes bancas privadas condicionan tasas preferenciales a métricas de carbono verificadas. Sin datos, pagas más.',
  },
  {
    ico: '📊',
    title: 'Bolsas y reguladores locales se mueven',
    desc: 'CNBV en México, CMF en Chile y CVM en Brasil ya emitieron guías. En 2–3 años será obligatorio. Quien llegue tarde pagará el costo de adaptarse en crisis.',
  },
];

function Urgency() {
  return (
    <section className="lyc-bg-dark">
      <div className="lyc-section">
        <div className="lyc-label">Por qué ahora</div>
        <h2 className="lyc-h2-d">
          La regulación <span className="teal">ya llegó.</span><br />
          Solo falta que te encuentre preparado.
        </h2>
        <p className="lyc-sub-d">
          Las empresas que midan hoy tienen ventaja competitiva, acceso a capital verde y menos riesgo regulatorio. Las que esperen pagarán el doble en adaptación de emergencia.
        </p>
        <div className="lyc-urgency-row">
          {urgencies.map(u => (
            <div key={u.title}>
              <div className="lyc-urgency-ico">{u.ico}</div>
              <div className="lyc-urgency-title">{u.title}</div>
              <div className="lyc-urgency-desc">{u.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────
const plans = [
  {
    name: 'Starter',
    price: 'Gratis',
    desc: 'Para empresas que quieren entender su punto de partida sin riesgo.',
    features: [
      'Huella de carbono Scope 1 y 2',
      '1 sede / planta',
      'Reporte PDF básico',
      'Hasta 3 usuarios',
    ],
    cta: 'Empezar gratis',
    href: '#contacto',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$490 USD/mes',
    desc: 'Para empresas que necesitan cumplir con clientes, inversores o reguladores.',
    features: [
      'Scope 1, 2 y 3 completo',
      'Multi-sede ilimitado',
      'Reportes GRI / ESRS / CDP',
      'Roadmap de reducción con ROI',
      'Soporte prioritario',
    ],
    cta: 'Hablar con ventas',
    href: '#contacto',
    featured: true,
  },
];

function Pricing() {
  return (
    <section className="lyc-bg-white" id="precio">
      <div className="lyc-section">
        <div className="lyc-label">Precio</div>
        <h2 className="lyc-h2-l">
          Transparente.<br />
          <span className="teal">Sin sorpresas al final del mes.</span>
        </h2>
        <p className="lyc-sub-l">
          Empieza gratis y escala cuando necesites reportes más completos o múltiples sedes. Sin contratos anuales obligatorios.
        </p>
        <div className="lyc-pricing-grid">
          {plans.map(p => (
            <div className={`lyc-price-card${p.featured ? ' featured' : ''}`} key={p.name}>
              <div className="lyc-price-name">{p.name}</div>
              <div className="lyc-price-amount">{p.price}</div>
              <div className="lyc-price-desc">{p.desc}</div>
              <div className="lyc-price-divider" />
              <ul className="lyc-price-features">
                {p.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <a className="lyc-btn-primary" href={p.href}>{p.cta} →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Final ──────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="lyc-cta-wrap" id="contacto">
      <div className="lyc-cta-inner">
        <div className="lyc-label">Empieza hoy</div>
        <h2 className="lyc-h2-d">
          Tu primer reporte de carbono<br />
          <span className="teal">listo esta semana.</span>
        </h2>
        <p className="lyc-sub-d">
          Sin compromiso. Sin consultor. Solo sube tus facturas y nosotros hacemos el resto.
        </p>
        <div className="lyc-hero-actions">
          <a className="lyc-btn-primary" href="mailto:hola@sustenty.com?subject=Quiero%20empezar">
            Calcular mi huella gratis →
          </a>
          <a className="lyc-btn-ghost-dark" href="mailto:hola@sustenty.com?subject=Demo%20Sustenty">
            Pedir una demo
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="lyc-footer">
      <div className="lyc-footer-logo">Sustenty</div>
      <div className="lyc-footer-links">
        <a href="mailto:hola@sustenty.com">Contacto</a>
        <a href="/privacidad">Privacidad</a>
        <a href="/terminos">Términos</a>
      </div>
      <div className="lyc-footer-copy">© {new Date().getFullYear()} Sustenty. Todos los derechos reservados.</div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────
export default function LandingYC() {
  return (
    <>
      <Nav />
      <Hero />
      <Problem />
      <Agents />
      <HowItWorks />
      <Urgency />
      <Pricing />
      <CTASection />
      <Footer />
    </>
  );
}
