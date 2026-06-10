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
  },
  {
    id: 'paso-2',
    num: 2,
    title: 'Panel principal',
    desc: 'Tras iniciar sesión verás tu panel. Desde ahí accedes a los servicios del alumno.',
    tips: [
      'Revisa que aparezca el nombre y número de control correctos arriba a la derecha.',
      'Para registrar salida a pie, entra al módulo correspondiente desde el menú lateral o la tarjeta principal.',
    ],
    image: '/guia/02-panel-principal.png',
    label: 'Inicio — Panel principal',
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
      <div className="guia-grid-bg" aria-hidden />

      <div className="guia-inner">
        <header className="guia-hero">
          <div className="guia-badge">
            <span aria-hidden>📱</span>
            Guía rápida SSIW
          </div>
          <h1>Cómo usar el portal Winston</h1>
          <p>
            Sigue estos pasos para registrar la salida a pie de tu hijo o hija en el{' '}
            <strong>Sistema de Servicios Integrales Winston</strong>.
          </p>
        </header>

        <nav className="guia-steps-nav" aria-label="Pasos de la guía">
          {STEPS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="guia-step-pill">
              {s.num}. {s.title.split(' ').slice(0, 2).join(' ')}
            </a>
          ))}
        </nav>

        {STEPS.map((step) => (
          <section key={step.id} id={step.id} className="guia-step">
            <div className="guia-step-header">
              <div className="guia-step-num" aria-hidden>
                {step.num}
              </div>
              <div>
                <h2 className="guia-step-title">{step.title}</h2>
                <p className="guia-step-desc">{step.desc}</p>
                <ul className="guia-step-tips">
                  {step.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            <figure className="guia-shot-wrap">
              <div className="guia-shot-inner">
                <img
                  src={step.image}
                  alt={`Paso ${step.num}: ${step.title}`}
                  width={1280}
                  height={720}
                  loading={step.num <= 2 ? 'eager' : 'lazy'}
                />
              </div>
              <figcaption className="guia-shot-label">{step.label}</figcaption>
            </figure>
          </section>
        ))}

        <section className="guia-cta-section" id="acceso">
          <h2>¿Listo para entrar?</h2>
          <p>Usa esta dirección para acceder al portal desde cualquier dispositivo.</p>

          <a href={PORTAL_URL} className="guia-url-display">
            {PORTAL_URL}
          </a>

          <a href={PORTAL_URL} className="guia-btn-primary">
            Ir al portal SSIW
            <span aria-hidden>→</span>
          </a>

          <button type="button" className="guia-btn-secondary" onClick={copyUrl}>
            {copied ? '✓ Enlace copiado' : 'Copiar enlace'}
          </button>
        </section>

        <footer className="guia-footer">
          © {new Date().getFullYear()} Instituto Winston Churchill · SSIW
        </footer>
      </div>

      <div className="guia-sticky-cta">
        <a href={PORTAL_URL}>Ingresar al sistema →</a>
      </div>
    </div>
  );
}
