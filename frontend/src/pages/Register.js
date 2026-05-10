import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Aquí iría la lógica real de registro (API)
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-success">
          <h2>Registro exitoso</h2>
          <p>Revisa tu correo para activar tu cuenta y comenzar a usar Sustenty.</p>
          <Link className="auth-strong-link" to="/login">Ir a iniciar sesion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <img src="/logo_saas.png" alt="Sustenty logo" />
          <span>Sustenty</span>
        </Link>

        <h1 className="auth-title">
          Crea tu <span className="teal">cuenta.</span>
        </h1>
        <p className="auth-subtitle">
          Configura tu organización y comienza a medir tu impacto en minutos.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="auth-label" htmlFor="register-name">Nombre completo</label>
            <div className="auth-input-wrap">
              <input
                id="register-name"
                className="auth-input"
                type="text"
                name="name"
                placeholder="Ej. Maria Gonzalez"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="auth-label" htmlFor="register-email">Correo electronico</label>
            <div className="auth-input-wrap">
              <input
                id="register-email"
                className="auth-input"
                type="email"
                name="email"
                placeholder="nombre@empresa.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="auth-label" htmlFor="register-password">Contrasena</label>
            <div className="auth-input-wrap">
              <input
                id="register-password"
                className="auth-input"
                type="password"
                name="password"
                placeholder="Minimo 8 caracteres"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button className="auth-btn-primary" type="submit">Crear cuenta</button>
        </form>

        <p className="auth-foot">
          ¿Ya tienes cuenta? <Link className="auth-link" to="/login">Inicia sesion</Link>
        </p>
      </div>
    </div>
  );
}
