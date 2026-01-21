import React from 'react';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import './SaasLanding.css';

export function HeroSaasableSustenty() {
  return (
    <section className="saas-hero saas-hero-saasable">
      <div className="saas-hero-content">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="saas-chip">NUEVO EN SUSTENTY</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          Plataforma SaaS para gestión ESG
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          Centraliza, mide y mejora tu impacto ambiental, social y de gobernanza con una experiencia moderna y colaborativa.
        </motion.p>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}>
          <Button
            href="/register"
            className="saas-cta-btn"
            variant="contained"
            style={{ background: '#15b19d', color: '#fff', borderRadius: 6, fontWeight: 700, padding: '12px 32px', fontSize: '1.1rem' }}
          >
            Comenzar ahora
          </Button>
        </motion.div>
      </div>
      <motion.img src="/logo-icon.svg" alt="Sustenty Icon" className="saas-hero-img" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} />
    </section>
  );
}

export function FeatureSaasableSustenty() {
  return (
    <section id="features" className="saas-section saas-features saas-features-saasable">
      <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        ¿Por qué elegir Sustenty?
      </motion.h2>
      <div className="saas-features-list">
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
          <h3>Automatización inteligente</h3>
          <p>Flujos automáticos para cumplimiento y gestión documental.</p>
        </motion.div>
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
          <h3>Colaboración en tiempo real</h3>
          <p>Equipos conectados, roles y tareas para lograr objetivos sostenibles.</p>
        </motion.div>
        <motion.div className="saas-feature-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
          <h3>Analítica visual</h3>
          // Archivo eliminado.
        </motion.div>
