'use client';

import { useCallback, useState } from 'react';
import './guia.css';

const PORTAL_URL = 'https://ssiw.vercel.app/login';

const STEPS = [
  {
    id: 'paso-1',
    num: 1,
    title: 'Ingresa al portal',
    desc: 'Abre el sistema e introduce el número de control del alumno (el mismo que usas en el colegio).',
    tips: [
      'Escribe solo números, sin espacios.',
      'Si no lo recuerdas, usa el enlace «¿No conoce el número de control?».',
      'Pulsa «Ingresar al Sistema» para continuar.',
    ],
    image: '/guia/01-login.png',
    label: 'Pantalla de acceso',
    accent: '#2563eb',
    accentSoft: '#dbeafe',
    icon: '🔐',
  },
  {
    id: 'paso-2',
    num: 2,
    title: 'Panel principal',
    desc: 'Tras iniciar sesión verás tu panel. Desde ahí accedes a los servicios del alumno.',
    tips: [
      'Revisa que aparezca el nombre y número de control correctos arriba a la derecha.',
      'Para registrar salida a pie, entra al módulo desde el menú lateral o la tarjeta principal.',
    ],
    image: '/guia/02-panel-principal.png',
    label: 'Inicio — Panel principal',
    accent: '#7c3aed',
    accentSoft: '#ede9fe',
    icon: '🏠',
  },
  {
    id: 'paso-3',
    num: 3,
    title: 'Registro de salida a pie',
    desc: 'En esta pantalla creas un nuevo permiso o gestionas los familiares autorizados.',
    tips: [
      'Toca «Nuevo Registro» para configurar cuándo puede salir el alumno a pie.',
      'En «Familiares Autorizados» ves quién puede recogerlo.',
      'Usa «+ Agregar Familiar» si necesitas registrar a otra persona.',
    ],
    image: '/guia/03-registro-salida.png',
    label: 'Registro de salida',
    accent: '#0d9488',
    accentSoft: '#ccfbf1',
    icon: '📝',
  },
  {
    id: 'paso-4',
    num: 4,
    title: 'Registro permanente',
    desc: 'Elige los días de la semana en que el alumno saldrá a pie de forma recurrente.',
    tips: [
      'Selecciona la pestaña «Permanente».',
      'Marca hasta 5 días entre lunes y viernes.',
      'Pulsa «Guardar» (botón verde) para confirmar.',
    ],
    image: '/guia/04-permanente.png',
    label: 'Días permanentes',
    accent: '#16a34a',
    accentSoft: '#dcfce7',
    icon: '🔁',
  },
  {
    id: 'paso-5',
    num: 5,
    title: 'Registro eventual',
    desc: 'Para fechas puntuales (eventos, excepciones), usa el calendario mensual.',
    tips: [
      'Selecciona la pestaña «Eventual».',
      'Toca los días del calendario que aplican.',
      'Revisa el contador «días seleccionados» y guarda los cambios.',
    ],
    image: '/guia/05-eventual.png',
    label: 'Fechas eventuales',
    accent: '#ea580c',
    accentSoft: '#ffedd5',
    icon: '📅',
  },
  {
    id: 'paso-6',
    num: 6,
    title: 'Familiares autorizados',
    desc: 'Mantén actualizada la lista de personas que pueden recoger al alumno.',
    tips: [
      'Cada tarjeta muestra teléfono y correo del familiar.',
      '«Editar» actualiza sus datos; «Eliminar» lo quita de la lista.',
      'Los tutores principales suelen aparecer como Tutor 1 y Tutor 2.',
    ],
    image: '/guia/06-familiares.png',
    label: 'Gestión de familiares',
    accent: '#db2777',
    accentSoft: '#fce7f3',
    icon: '👨‍👩‍👧',
  },
] as const;

export default function GuiaPage() {
  const [copied, setCopied] = useState(false);

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PORTAL_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback silencioso */
    }
  }, []);

  return (
    <div className="guia-page">
      <div className="guia-blob guia-blob-a" aria-hidden />
      <div className="guia-blob guia-blob-b" aria-hidden />
      <div className="guia-blob guia-blob-c" aria-hidden />

      <header className="guia-topbar">
        <div className="guia-topbar-inner">
          <div className="guia-brand">
            <span className="guia-brand-icon" aria-hidden>
              <svg viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 3L4 10v8c0 7.2 5.2 13.5 12 15 6.8-1.5 12-7.8 12-15v-8L16 3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path d="M16 11v8M12 15h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <strong>SSIW</strong>
              <span>Instituto Winston Churchill</span>
            </div>
          </div>
          <a href={PORTAL_URL} className="guia-topbar-cta">
            Ir al portal →
          </a>
        </div>
      </header>

      <div className="guia-shell">
        <section className="guia-hero">
          <div className="guia-hero-copy">
            <span className="guia-hero-tag">Guía paso a paso · 6 minutos</span>
            <h1>
              Aprende a usar el{' '}
              <em>portal de salida a pie</em>
            </h1>
            <p>
              Tutorial visual para papás y tutores. Registra permisos, elige días y administra
              familiares autorizados desde cualquier celular o computadora.
            </p>
            <div className="guia-hero-actions">
              <a href="#paso-1" className="guia-btn-hero">
                Comenzar tutorial
              </a>
              <a href="#acceso" className="guia-btn-ghost">
                Ir directo al login
              </a>
            </div>
          </div>
        </section>

        <nav className="guia-rail" aria-label="Pasos de la guía">
          {STEPS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="guia-rail-item"
              style={{ '--rail-accent': s.accent } as React.CSSProperties}
            >
              <span className="guia-rail-dot">{s.num}</span>
              <span className="guia-rail-label">{s.title}</span>
            </a>
          ))}
        </nav>

        <div className="guia-steps">
          {STEPS.map((step, i) => (
            <article
              key={step.id}
              id={step.id}
              className={`guia-step-card ${i % 2 === 1 ? 'guia-step-reverse' : ''}`}
              style={
                {
                  '--step-accent': step.accent,
                  '--step-soft': step.accentSoft,
                } as React.CSSProperties
              }
            >
              <div className="guia-step-content">
                <div className="guia-step-badge">
                  <span className="guia-step-icon">{step.icon}</span>
                  Paso {step.num} de 6
                </div>
                <h2>{step.title}</h2>
                <p className="guia-step-lead">{step.desc}</p>
                <ul className="guia-step-tips">
                  {step.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>

              <figure className="guia-step-visual">
                <div className="guia-shot-frame">
                  <img
                    src={step.image}
                    alt={`Paso ${step.num}: ${step.title}`}
                    width={1280}
                    height={720}
                    loading={step.num <= 2 ? 'eager' : 'lazy'}
                  />
                </div>
                <figcaption>{step.label}</figcaption>
              </figure>
            </article>
          ))}
        </div>

        <section className="guia-cta" id="acceso">
          <div className="guia-cta-glow" aria-hidden />
          <div className="guia-cta-inner">
            <div className="guia-cta-logos">
              <img
                src="/logos/logo-winston-churchill.png"
                alt="Instituto Winston Churchill"
                width={160}
                height={120}
                className="guia-cta-logo"
              />
              <img
                src="/logos/logo-winston-educativo.png"
                alt="Winston Educativo"
                width={160}
                height={120}
                className="guia-cta-logo guia-cta-logo--end"
              />
            </div>
            <h2>¿Listo? Entra al portal</h2>
            <p>Guarda este enlace o escanea el QR de nuevo cuando lo necesites.</p>

            <div className="guia-qr-wrap">
              <img
                src="/qr-ssiw-login.png"
                alt="Código QR para ingresar a https://ssiw.vercel.app/login"
                width={220}
                height={220}
                className="guia-qr"
              />
              <span className="guia-qr-caption">Escanea para ir al login</span>
            </div>

            <a href={PORTAL_URL} className="guia-url-mega">
              {PORTAL_URL}
            </a>

            <div className="guia-cta-buttons">
              <a href={PORTAL_URL} className="guia-btn-mega">
                Ingresar al Sistema SSIW
              </a>
              <button type="button" className="guia-btn-copy" onClick={copyUrl}>
                {copied ? '✓ Copiado' : 'Copiar enlace'}
              </button>
            </div>
          </div>
        </section>

        <footer className="guia-footer">
          © {new Date().getFullYear()} Instituto Winston Churchill · Sistema de Servicios Integrales
          Winston
        </footer>
      </div>

      <div className="guia-sticky">
        <a href={PORTAL_URL}>Ingresar al sistema →</a>
      </div>
    </div>
  );
}
