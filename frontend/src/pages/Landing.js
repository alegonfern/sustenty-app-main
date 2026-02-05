import React, { useState } from 'react';
import './Landing.css';
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
      <section className="landing-hero">
        <h1>Gestiona la Sostenibilidad de tu empresa.</h1>
        <p>Centraliza, mide y mejora el impacto ambiental, social y de gobernanza de tu organización con una plataforma SaaS minimalista y colaborativa.</p>
        <a href="/register" className="landing-cta landing-cta-main">Comenzar ahora</a>
      </section>
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
      <section id="clientes" className="landing-clients">
        <h3>Han confiado en nuestra tecnología</h3>
        <div className="landing-logos">
    
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" title="Microsoft" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" title="Google" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg" alt="Tesla" title="Tesla" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" title="Apple" />
        </div>
      </section>
      <section id="precios" className="landing-pricing">
        <h3>Precios simples y transparentes</h3>
        <div style={{display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap'}}>
          <div className="landing-price-card">
            <div>
              <span className="landing-price">$0</span>
              <span className="landing-price-desc">/mes</span>
            </div>
            <ul>
              <li>Hasta 5 usuarios</li>
              <li>Reportes básicos ESG</li>
              <li>Soporte por email</li>
            </ul>
            <a href="/register" className="landing-cta">Comenzar gratis</a>
            <div style={{fontWeight:600, color:'#15b19d', marginTop:'0.5rem'}}>Gratuito</div>
          </div>
          <div className="landing-price-card">
            <div>
              <span className="landing-price">$49</span>
              <span className="landing-price-desc">/mes</span>
            </div>
            <ul>
              <li>Usuarios ilimitados</li>
              <li>Reportes avanzados ESG</li>
              <li>Integraciones y API</li>
              <li>Soporte prioritario</li>
            </ul>
            <a href="/register" className="landing-cta">Solicitar demo</a>
            <div style={{fontWeight:600, color:'#15b19d', marginTop:'0.5rem'}}>Plan Empresa</div>
          </div>
          <div className="landing-price-card">
            <div>
              <span className="landing-price">$99</span>
              <span className="landing-price-desc">/mes</span>
            </div>
            <ul>
              <li>Acceso a múltiples empresas</li>
              <li>Panel de clientes y reportes</li>
              <li>Herramientas para consultores</li>
              <li>Soporte dedicado</li>
            </ul>
            <a href="/register" className="landing-cta">Contactar ventas</a>
            <div style={{fontWeight:600, color:'#15b19d', marginTop:'0.5rem'}}>Plan Consultor</div>
          </div>
        </div>
      </section>
      <section id="contact" className="landing-contact" style={{textAlign: 'center', padding: '3rem 2vw'}}>
        <h3>Contacto</h3>
        <ContactForm />
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
function ContactForm() {
  const [form, setForm] = React.useState({ name: '', email: '', company: '', subject: 'Contacto web', message: '' });
  const [step, setStep] = React.useState(0);
  const [enviando, setEnviando] = React.useState(false);
  const [exito, setExito] = React.useState(false);
  const [error, setError] = React.useState('');

  const fields = [
    {
      name: 'name',
      label: '¿Cuál es tu nombre?',
      type: 'text',
      placeholder: 'Nombre completo',
      required: true
    },
    {
      name: 'email',
      label: '¿Cuál es tu correo?',
      type: 'email',
      placeholder: 'ejemplo@correo.com',
      required: true
    },
    {
      name: 'company',
      label: '¿En qué empresa trabajas?',
      type: 'text',
      placeholder: 'Nombre de la empresa',
      required: true
    },
    {
      name: 'message',
      label: '¿En qué podemos ayudarte?',
      type: 'textarea',
      placeholder: 'Escribe tu mensaje...',
      required: true
    }
  ];

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = e => {
    e.preventDefault();
    if (!form[fields[step].name]) return;
    setStep(step + 1);
  };

  const handlePrev = e => {
    e.preventDefault();
    setStep(step - 1);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    setExito(false);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setExito(true);
        setForm({ name: '', email: '', company: '', subject: 'Contacto web', message: '' });
        setStep(0);
      } else {
        setError(data.message || 'No se pudo enviar el mensaje.');
      }
    } catch {
      setError('Error de red.');
    }
    setEnviando(false);
  };

  return (
    <form onSubmit={step === fields.length - 1 ? handleSubmit : handleNext} style={{maxWidth: 400, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div style={{display:'flex',justifyContent:'center',gap:'0.5rem',marginBottom:'1rem'}}>
        {fields.map((_, i) => (
          <div key={i} style={{width:24,height:24,borderRadius:'50%',background:i<=step?'#15b19d':'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:14}}>{i+1}</div>
        ))}
      </div>
      <label style={{fontWeight:600,fontSize:'1.1rem',marginBottom:'0.5rem'}}>{fields[step].label}</label>
      {fields[step].type === 'textarea' ? (
        <textarea name={fields[step].name} placeholder={fields[step].placeholder} value={form[fields[step].name]} onChange={handleChange} required rows={4} style={{padding:'0.8rem',borderRadius:8,border:'1px solid #e5e7eb',fontSize:'1rem'}} />
      ) : (
        <input name={fields[step].name} type={fields[step].type} placeholder={fields[step].placeholder} value={form[fields[step].name]} onChange={handleChange} required style={{padding:'0.8rem',borderRadius:8,border:'1px solid #e5e7eb',fontSize:'1rem'}} />
      )}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:'1rem'}}>
        {step > 0 && <button onClick={handlePrev} type="button" style={{background:'none',border:'none',color:'#15b19d',fontWeight:600}}>Atrás</button>}
        <button type="submit" disabled={enviando} style={{background:'#15b19d',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:700}}>
          {step === fields.length - 1 ? (enviando ? 'Enviando...' : 'Enviar') : 'Siguiente'}
        </button>
      </div>
      {exito && <div style={{color:'#15b19d',marginTop:'1rem'}}>¡Mensaje enviado!</div>}
      {error && <div style={{color:'red',marginTop:'1rem'}}>{error}</div>}
    </form>
  );
}
