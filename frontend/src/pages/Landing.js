import React, { useState } from 'react';
import AnimatedWords from './AnimatedWords';
import './Landing.css';
import HeroSection from './HeroSection';
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, IconButton, List, ListItem, ListItemText, useMediaQuery } from '@mui/material';

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 900px)');
  const menuItems = [
    { label: 'Características', href: '#features' },
    { label: 'Clientes', href: '#clientes' },
    { label: 'Precios', href: '#precios' },
    { label: 'Comenzar', href: '/register', className: 'landing' },
    { label: 'Iniciar Sesión', href: '/login', className: 'landing-cta' }
  ];

  return (
    <main className="landing-root">
      <header className="landing-header">
        <img src="/logo-full.svg" alt="Sustenty Logo" className="landing-logo" />
        <nav className="landing-nav">
          {!isMobile && (
            <div className="landing-nav-desktop" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              {menuItems.map(item => (
                <a key={item.label} href={item.href} className={item.className || ''} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>
                  {item.label}
                </a>
              ))}
            </div>
          )}
          {isMobile && (
            <div className="landing-nav-mobile">
              <IconButton onClick={() => setMenuOpen(true)}>
                <MenuIcon fontSize="large" />
              </IconButton>
              <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
                <List sx={{ width: 220 }}>
                  {menuItems.map(item => (
                    item.label === 'Iniciar Sesión' ? (
                      <ListItem key={item.label} disablePadding sx={{ justifyContent: 'center', py: 2 }}>
                        <a href={item.href} style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                          <button style={{
                            background: '#15b19d',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.75rem 1.5rem',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            width: '90%'
                          }}>
                            {item.label}
                          </button>
                        </a>
                      </ListItem>
                    ) : (
                      <ListItem button key={item.label} component="a" href={item.href} onClick={() => setMenuOpen(false)}>
                        <ListItemText primary={item.label} />
                      </ListItem>
                    )
                  ))}
                </List>
              </Drawer>
            </div>
          )}
        </nav>
      </header>
      <HeroSection />
      {/* ...existing code... */}


      {/* Sección Beneficios */}
      <section id="beneficios" className="landing-benefits" style={{background:'#fafbfb',padding:'3rem 2vw',textAlign:'center'}}>
        <h3 style={{color:'#15b19d',fontWeight:700,fontSize:'2rem',marginBottom:'2rem'}}>Beneficios de usar Sustenty</h3>
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'2rem'}}>
          <div style={{maxWidth:320,background:'#fff',borderRadius:12,boxShadow:'0 2px 12px #0001',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <span style={{fontSize:'2rem',marginBottom:8}}>🗄️</span>
            <h4 style={{color:'#15b19d'}}>Centralización de datos ESG</h4>
            <p>Gestiona toda la información ambiental, social y de gobernanza en un solo lugar, facilitando el acceso y la trazabilidad.</p>
          </div>
          <div style={{maxWidth:320,background:'#fff',borderRadius:12,boxShadow:'0 2px 12px #0001',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <span style={{fontSize:'2rem',marginBottom:8}}>🛡️</span>
            <h4 style={{color:'#15b19d'}}>Cumplimiento normativo simplificado</h4>
            <p>Automatiza reportes y procesos para cumplir con regulaciones y estándares internacionales de sostenibilidad.</p>
          </div>
          <div style={{maxWidth:320,background:'#fff',borderRadius:12,boxShadow:'0 2px 12px #0001',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <span style={{fontSize:'2rem',marginBottom:8}}>🤝</span>
            <h4 style={{color:'#15b19d'}}>Colaboración y transparencia</h4>
            <p>Permite a equipos y consultores trabajar juntos, asignar tareas y compartir avances en tiempo real.</p>
          </div>
          <div style={{maxWidth:320,background:'#fff',borderRadius:12,boxShadow:'0 2px 12px #0001',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <span style={{fontSize:'2rem',marginBottom:8}}>📊</span>
            <h4 style={{color:'#15b19d'}}>Analítica y visualización</h4>
            <p>Obtén insights visuales y reportes automáticos para tomar mejores decisiones y comunicar tu impacto.</p>
          </div>
        </div>
      </section>

      {/* ...otras secciones... */}

      {/* Segmento de red de empresas sostenibles */}
      <section className="landing-network-section">
        <h2 className="landing-network-title">Sé parte de la red de empresas comprometidas con el planeta</h2>
        <div className="landing-network-carousel">
          <div className="landing-network-carousel-track">
            {Array.from({length: 20}).map((_, idx) => {
              const empresas = [
                { name: "EcoTech Solutions", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", score: 92, category: "Tecnología", location: "Madrid, España", description: "Líder en soluciones digitales para la gestión ambiental." },
                { name: "GreenFoods", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", score: 87, category: "Alimentación", location: "Barcelona, España", description: "Innovación en productos sostenibles y reducción de huella de carbono." },
                { name: "SolarFuture", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg", score: 95, category: "Energía", location: "Valencia, España", description: "Impulsando la transición energética con soluciones solares." },
                { name: "BioCare", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", score: 80, category: "Salud", location: "Sevilla, España", description: "Comprometidos con la salud y el bienestar sostenible." },
                { name: "BlueWater", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", score: 90, category: "Agua", location: "Bilbao, España", description: "Soluciones innovadoras para la gestión del agua." },
                { name: "EcoLogistics", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", score: 85, category: "Logística", location: "Zaragoza, España", description: "Logística sostenible y reducción de emisiones." },
                { name: "GreenBuild", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", score: 88, category: "Construcción", location: "Madrid, España", description: "Construcción ecológica y materiales sostenibles." },
                { name: "SunPower", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg", score: 93, category: "Energía", location: "Valencia, España", description: "Energía solar para empresas y hogares." },
                { name: "BioFoods", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", score: 82, category: "Alimentación", location: "Barcelona, España", description: "Alimentos orgánicos y sostenibles." },
                { name: "CleanTech", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", score: 89, category: "Tecnología", location: "Madrid, España", description: "Tecnología limpia para la industria." },
                { name: "GreenCare", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", score: 91, category: "Salud", location: "Sevilla, España", description: "Salud y bienestar con enfoque sostenible." },
                { name: "EcoEnergy", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", score: 86, category: "Energía", location: "Valencia, España", description: "Energía renovable para empresas." },
                { name: "BlueFoods", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg", score: 84, category: "Alimentación", location: "Barcelona, España", description: "Alimentos sostenibles del mar." },
                { name: "GreenLogistics", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", score: 90, category: "Logística", location: "Zaragoza, España", description: "Logística verde y eficiente." },
                { name: "EcoBuild", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", score: 87, category: "Construcción", location: "Madrid, España", description: "Edificación sostenible y materiales ecológicos." },
                { name: "SunFoods", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", score: 92, category: "Alimentación", location: "Barcelona, España", description: "Alimentos solares y sostenibles." },
                { name: "BioLogistics", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", score: 88, category: "Logística", location: "Zaragoza, España", description: "Logística ecológica y eficiente." },
                { name: "GreenWater", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg", score: 94, category: "Agua", location: "Bilbao, España", description: "Gestión sostenible del agua." },
                { name: "EcoCare", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", score: 83, category: "Salud", location: "Sevilla, España", description: "Bienestar y salud sostenible." },
                { name: "CleanBuild", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", score: 89, category: "Construcción", location: "Madrid, España", description: "Construcción limpia y eficiente." }
              ];
              const empresa = empresas[idx % empresas.length];
              return (
                <div className="landing-network-card" key={idx}>
                  <div className="landing-network-card-header">
                    <img src={empresa.logo} alt={empresa.name} className="landing-network-logo" />
                    <div>
                      <div className="landing-network-name">{empresa.name}</div>
                      <div className="landing-network-category">{empresa.category} &bull; {empresa.location}</div>
                    </div>
                    <div className="landing-network-score">{empresa.score}<span> ESG</span></div>
                  </div>
                  <div className="landing-network-desc">{empresa.description}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="landing-network-footer">
          <span className="landing-network-info">Próximamente podrás filtrar, buscar y rankear empresas según su compromiso sostenible.</span>
        </div>
      </section>

      {/* ...otras secciones... */}

      {/* Sección Features (Automatización, Colaboración, Analítica visual) - ahora justo después de beneficios */}
      <section id="features" className="landing-features">
        <div className="landing-feature">
          <h2>Automatización</h2>
          <p>Procesos automáticos para cumplimiento y reportes ESG.</p>
        </div>
        <div className="landing-feature">
          <h2>Colaboración</h2>
          <p>Equipos conectados y roles claros para lograr objetivos sostenibles.</p>
        </div>
        <div className="landing-feature">
          <h2>Analítica visual</h2>
          <p>Visualiza métricas clave y reportes de manera intuitiva.</p>
        </div>
      </section>
     
      <section id="precios" className="landing-pricing">
        <h3>Precios simples y transparentes</h3>
        <div style={{display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap'}}>
          <div className="landing-price-card">
            <div>
                <span className="landing-price">Gratis</span>
                <span className="landing-price-desc"></span>
            </div>
            <ul>
              <li>Hasta 5 usuarios</li>
              <li>Reportes básicos ESG</li>
              <li>Soporte por email</li>
            </ul>
              <a href="#contact" className="landing-cta">Comenzar gratis</a>
            <div style={{fontWeight:600, color:'#15b19d', marginTop:'0.5rem'}}>Gratuito</div>
          </div>
          <div className="landing-price-card">
            <div>
                <span className="landing-price">Cotizar</span>
                <span className="landing-price-desc"></span>
            </div>
            <ul>
              <li>Usuarios ilimitados</li>
              <li>Reportes avanzados ESG</li>
              <li>Integraciones y API</li>
              <li>Soporte prioritario</li>
            </ul>
              <a href="#contact" className="landing-cta">Solicitar demo</a>
            <div style={{fontWeight:600, color:'#15b19d', marginTop:'0.5rem'}}>Plan Empresa</div>
          </div>
          <div className="landing-price-card">
            <div>
                <span className="landing-price">Cotizar</span>
                <span className="landing-price-desc"></span>
            </div>
            <ul>
              <li>Acceso a múltiples empresas</li>
              <li>Panel de clientes y reportes</li>
              <li>Herramientas para consultores</li>
              <li>Soporte dedicado</li>
            </ul>
              <a href="#contact" className="landing-cta">Contactar ventas</a>
            <div style={{fontWeight:600, color:'#15b19d', marginTop:'0.5rem'}}>Plan Consultor</div>
          </div>
        </div>
      </section>
      <section id="contact" className="landing-contact contact-two-cols">
        <div className="contact-boxes-wrapper">
          <div className="contact-cta-box">
            <h2 className="contact-cta-title">
              Construyamos juntos un futuro más <br/>
              <span className="cta-animated-word"><AnimatedWords words={["verde", "justo", "sostenible"]} /></span>
            </h2>
            <p className="contact-cta-desc">
              Da el primer paso hacia la transformación sostenible de tu empresa.<br />
              Déjanos tus datos y nuestro equipo te contactará para mostrarte cómo Sustenty puede ayudarte a liderar el cambio.
            </p>
          </div>
          <div className="contact-form-box">
            <div className="contact-form-box-inner">
              <ContactDemoForm />
            </div>
          </div>
        
        
        </div>
       
      </section>
      
      
      <section className="landing-faq-section">
        <h2 className="landing-faq-title">Preguntas frecuentes sobre Sustenty</h2>
        <div className="landing-faq-list">
          <details className="landing-faq-item">
            <summary>¿Qué es Sustenty y para quién está pensada?</summary>
            <div>Sustenty es una plataforma SaaS para la gestión integral de la sostenibilidad, cumplimiento ESG y reputación corporativa. Está pensada para empresas, consultores y equipos que buscan centralizar, medir y mejorar su impacto ambiental, social y de gobernanza.</div>
          </details>
          <details className="landing-faq-item">
            <summary>¿Qué ventajas ofrece frente a hojas de cálculo o soluciones manuales?</summary>
            <div>Automatiza procesos, centraliza la información, facilita la colaboración y genera reportes visuales y automáticos, ahorrando tiempo y reduciendo errores.</div>
          </details>
          <details className="landing-faq-item">
            <summary>¿Puedo personalizar los reportes y métricas?</summary>
            <div>Sí, Sustenty permite personalizar reportes, indicadores y paneles según las necesidades de tu organización o clientes.</div>
          </details>
          <details className="landing-faq-item">
            <summary>¿Qué soporte ofrecen?</summary>
            <div>Ofrecemos soporte por email, chat y sesiones de onboarding personalizadas para ayudarte a sacar el máximo partido a la plataforma.</div>
          </details>
          <details className="landing-faq-item">
            <summary>¿Cómo puedo solicitar una demo?</summary>
            <div>Simplemente completa el formulario de solicitud de demo y nuestro equipo te contactará para agendar una sesión personalizada.</div>
          </details>
        </div>
      </section>
        

      <footer className="landing-footer" style={{background:'#fafbfb',color:'#222',padding:'2.5rem 0 1.2rem 0',marginTop:'3rem',borderTop:'1px solid #e5e7eb'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:'2rem',padding:'0 2vw'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <img src="/logo-full.svg" alt="Sustenty Logo" style={{height:38}} />
          </div>
          <nav style={{display:'flex',gap:'2rem',flexWrap:'wrap'}}>
            <a href="#features" style={{color:'#222',textDecoration:'none',fontWeight:500}}>Características</a>
            <a href="#beneficios" style={{color:'#222',textDecoration:'none',fontWeight:500}}>Beneficios</a>
            <a href="#precios" style={{color:'#222',textDecoration:'none',fontWeight:500}}>Precios</a>
            <a href="#contact" style={{color:'#222',textDecoration:'none',fontWeight:500}}>Contacto</a>
          </nav>
          <div style={{display:'flex',gap:'1.2rem'}}>
            <a href="https://twitter.com/sustenty" target="_blank" rel="noopener noreferrer" aria-label="Twitter" style={{color:'#15b19d',fontSize:'1.05rem',fontWeight:500}}>
              Twitter
            </a>
            <a href="https://linkedin.com/company/sustenty" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{color:'#15b19d',fontSize:'1.05rem',fontWeight:500}}>
              LinkedIn
            </a>
            <a href="mailto:hola@sustenty.com" aria-label="Email" style={{color:'#15b19d',fontSize:'1.05rem',fontWeight:500}}>
              Email
            </a>
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:'2rem',fontSize:'0.97rem',opacity:0.7}}>
          &copy; {new Date().getFullYear()} sustenty.com &mdash; Todos los derechos reservados
        </div>
      </footer>
    </main>
  );
}

// Componente de formulario de contacto

function ContactDemoForm() {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    company: '',
    role: '',
    message: '',
    subject: 'Solicitud de demo',
  });
  const [enviando, setEnviando] = React.useState(false);
  const [exito, setExito] = React.useState(false);
  const [error, setError] = React.useState('');

  // Validación simple
  const validate = () => {
    if (!form.name || !form.email || !form.company || !form.role || !form.message) {
      setError('Todos los campos son obligatorios.');
      return false;
    }
    // Validación de email
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Correo electrónico inválido.');
      return false;
    }
    return true;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setExito(false);
    if (!validate()) return;
    setEnviando(true);
    try {
      const axios = await import('axios');
      const payload = {
        name: form.name,
        email: form.email,
        company: form.company,
        subject: form.subject || 'Solicitud de demo',
        message: `${form.role ? 'Rol: ' + form.role + '\n' : ''}${form.message}`
      };
      const API_URL = process.env.REACT_APP_API_URL || '';
      const res = await axios.default.post(`${API_URL}/api/v1/contact/`, payload);
      if (res.data && res.data.success) {
        setExito(true);
        setForm({ name: '', email: '', company: '', role: '', message: '', subject: 'Solicitud de demo' });
      } else {
        setError(res.data.message || 'No se pudo enviar el mensaje.');
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || err.response.data.error || 'Error en el servidor.');
      } else {
        setError('Error de red o proxy.');
      }
    }
    setEnviando(false);
  };

  return (
    <form onSubmit={handleSubmit} className="contact-demo-form-full">
      <div className="contact-demo-form-fields">
        <label>Nombre completo</label>
        <input name="name" type="text" placeholder="Tu nombre" value={form.name} onChange={handleChange} required />

        <label>Correo electrónico</label>
        <input name="email" type="email" placeholder="ejemplo@correo.com" value={form.email} onChange={handleChange} required />

        <label>Empresa</label>
        <input name="company" type="text" placeholder="Nombre de la empresa" value={form.company} onChange={handleChange} required />

        <label>Cargo o rol</label>
        <input name="role" type="text" placeholder="Ej: Responsable ESG, CEO, Consultor..." value={form.role} onChange={handleChange} required />

        <label>¿Qué te gustaría ver en la demo?</label>
        <textarea name="message" placeholder="Cuéntanos tus necesidades o dudas..." value={form.message} onChange={handleChange} required rows={4} />
      </div>
      <button type="submit" disabled={enviando} className="contact-demo-form-btn">
        {enviando ? 'Enviando...' : 'Solicitar demo'}
      </button>
      {exito && <div style={{color:'#15b19d',marginTop:'1rem'}}>¡Mensaje enviado! Te contactaremos pronto.</div>}
      {error && <div style={{color:'red',marginTop:'1rem'}}>{error}</div>}
    </form>
  );
}
