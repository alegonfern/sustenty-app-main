import React from 'react';
import AnimatedWords from './AnimatedWords';
import './HeroSection.css';

const people = [
  { src: 'https://randomuser.me/api/portraits/men/32.jpg', alt: 'Persona 1', bg: '#a7f3d0' },
  { src: 'https://randomuser.me/api/portraits/women/44.jpg', alt: 'Persona 2', bg: '#fbcfe8' },
  { src: 'https://randomuser.me/api/portraits/women/68.jpg', alt: 'Persona 3', bg: '#fde68a' },
  { src: 'https://randomuser.me/api/portraits/men/65.jpg', alt: 'Persona 4', bg: '#f0abfc' },
  { src: 'https://randomuser.me/api/portraits/men/43.jpg', alt: 'Persona 5', bg: '#bae6fd' }
];

const logos = [
  'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg',
  'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg'
];

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div className="hero-content">
          <h1>
            Gestiona{' '}
            <span className="hero-highlight">
              <AnimatedWords words={["Huella de Co2", "Sostenibilidad", "Reputación", "Impacto", "Cumplimiento"]} typingSpeed={60} pause={900} interval={1200} />
            </span>{' '}de tu empresa.
          </h1>
          <p className="hero-desc">
            Centraliza, mide y mejora el impacto ambiental, social y de gobernanza de tu organización con una plataforma SaaS minimalista y colaborativa.
          </p>
          <a href="/register" className="hero-cta">Comienza ahora gratis</a>
          <div className="hero-logos">
            {logos.map((logo, i) => (
              <img src={logo} alt="logo" key={i} />
            ))}
          </div>
        </div>
        <div className="hero-dashboard-img">
          <img src="/dashboard.png" alt="Dashboard Sustenty" />
        </div>
      </div>
    </section>
  );
}
