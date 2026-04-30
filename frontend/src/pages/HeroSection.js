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
            IA que transforma tus procesos para hacerlos más eficientes y sostenibles
          </h1>
          <p className="hero-desc">
            Automatiza, escala y lidera el cambio sostenible en tu empresa con IA.
          </p>
          <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
            <a href="/register" className="hero-cta">Comenzar gratis</a>
            <a href="#como-funciona" className="hero-cta" style={{background:'transparent',border:'2px solid #15b19d',color:'#15b19d'}}>Ver cómo funciona</a>
          </div>
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
