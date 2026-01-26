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
        <h3>Confiado por equipos modernos</h3>
        <div className="landing-logos">
          <img src="/client1.svg" alt="Cliente 1" />
          <img src="/client2.svg" alt="Cliente 2" />
          <img src="/client3.svg" alt="Cliente 3" />
        </div>
      </section>
      <section id="precios" className="landing-pricing">
        <h3>Precios simples y transparentes</h3>
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
        </div>
      </section>
      <footer className="landing-footer">
        <span>&copy; {new Date().getFullYear()} sustenty.com </span>
      </footer>
    </main>
  );
}
