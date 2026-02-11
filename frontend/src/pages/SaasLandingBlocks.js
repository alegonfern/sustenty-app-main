import React from 'react';
import { motion } from 'framer-motion';
import './SaasLanding.css';

// Hero Sustenty adaptado del template saasable
export function HeroSustenty() {
  return (
    <section className="saas-hero">
      <div className="saas-hero-content">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          Impulsa la sostenibilidad de tu organización
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          La plataforma SaaS para gestión ESG, cumplimiento y equipos. Centraliza, mide y mejora tu impacto ambiental, social y de gobernanza.
        </motion.p>
        <motion.a href="/register" className="saas-cta-btn" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}>
          Comenzar ahora
        </motion.a>
      </div>
      <motion.img src="/logo-icon.svg" alt="Sustenty Icon" className="saas-hero-img" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} />
    </section>
  );
}

// Feature Sustenty adaptado del template saasable
export function FeatureSustenty() {
  return (
    <section id="features" className="saas-section saas-features">
      <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        Características principales
      </motion.h2>
      <div className="saas-features-list">
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
          <h3>Gestión ESG integral</h3>
          <p>Recopila, analiza y reporta datos ambientales, sociales y de gobernanza en un solo lugar.</p>
        </motion.div>
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h3>Automatización de cumplimiento</h3>
          <p>Facilita el cumplimiento normativo y la gestión documental con flujos inteligentes.</p>
        </motion.div>
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
          <h3>Colaboración en equipos</h3>
          <p>Organiza equipos, asigna roles y fomenta la colaboración para lograr objetivos sostenibles.</p>
        </motion.div>
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
          <h3>Analítica avanzada</h3>
          <p>Visualiza métricas clave, identifica oportunidades y comunica tu progreso con dashboards intuitivos.</p>
        </motion.div>
      </div>
    </section>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import './SaasLanding.css';

// Hero Sustenty adaptado del template saasable
export function HeroSustenty() {
  return (
    <section className="saas-hero">
      <div className="saas-hero-content">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          Impulsa la sostenibilidad de tu organización
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          La plataforma SaaS para gestión ESG, cumplimiento y equipos. Centraliza, mide y mejora tu impacto ambiental, social y de gobernanza.
        </motion.p>
        <motion.a href="/register" className="saas-cta-btn" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}>
          Comenzar ahora
        </motion.a>
      </div>
      <motion.img src="/logo-icon.svg" alt="Sustenty Icon" className="saas-hero-img" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} />
    </section>
  );
}

// Feature Sustenty adaptado del template saasable
export function FeatureSustenty() {
  return (
    <section id="features" className="saas-section saas-features">
      <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        Características principales
      </motion.h2>
      <div className="saas-features-list">
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
          <h3>Gestión ESG integral</h3>
          <p>Recopila, analiza y reporta datos ambientales, sociales y de gobernanza en un solo lugar.</p>
        </motion.div>
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h3>Automatización de cumplimiento</h3>
          <p>Facilita el cumplimiento normativo y la gestión documental con flujos inteligentes.</p>
        </motion.div>
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
          <h3>Colaboración en equipos</h3>
          <p>Organiza equipos, asigna roles y fomenta la colaboración para lograr objetivos sostenibles.</p>
        </motion.div>
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
          <h3>Analítica avanzada</h3>
          <p>Visualiza métricas clave, identifica oportunidades y comunica tu progreso con dashboards intuitivos.</p>
        </motion.div>
      </div>
    </section>
  );
}
