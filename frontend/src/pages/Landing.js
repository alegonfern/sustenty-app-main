import React from 'react';
import './Landing.css';

export default function Landing() {
  return (
    <main className="landing-root">
      <header className="landing-header">
        <img src="/logo-icon.svg" alt="Sustenty Logo" className="landing-logo" />
        <nav className="landing-nav">
          <a href="#features">Características</a>
          <a href="#clientes">Clientes</a>
          <a href="#precios">Precios</a>
          <a href="/register" className="landing">Comenzar</a>
          <a href="/login" className="landing-cta">Iniciar Sesión</a>
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
      <footer className="landing-footer">
        <span>&copy; {new Date().getFullYear()} sustenty.com </span>
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
