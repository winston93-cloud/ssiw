'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alumno, getNivelEducativo } from '@/types';
import FormularioRegistro from '@/components/registro/FormularioRegistro';

export default function DashboardPage() {
  const router = useRouter();
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'calendario'>('overview');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const alumnoData = localStorage.getItem('alumno');
    if (!alumnoData) {
      router.push('/login');
    } else {
      setAlumno(JSON.parse(alumnoData));
    }
  }, [mounted, router]);

  const handleLogout = () => {
    localStorage.removeItem('alumno');
    router.push('/login');
  };

  if (!mounted || !alumno) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando sistema...</p>
      </div>
    );
  }

  const nombreCompleto = alumno.alumno_nombre_completo || 
    `${alumno.alumno_nombre} ${alumno.alumno_app} ${alumno.alumno_apm}`;
  const nivel = getNivelEducativo(alumno.alumno_nivel);

  return (
    <main className="dashboard">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M24 4L6 14V22C6 32 12 40.5 24 44C36 40.5 42 32 42 22V14L24 4Z" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
          </div>
          <h2>SSIW</h2>
          <button className="sidebar-close" onClick={() => setMenuOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveView('overview'); setMenuOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <span>Inicio</span>
          </button>

          <button
            className={`nav-item ${activeView === 'calendario' ? 'active' : ''}`}
            onClick={() => { setActiveView('calendario'); setMenuOpen(false); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>Registro de Salida</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <button className="menu-toggle" onClick={() => setMenuOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <div className="header-title">
            <h1>{activeView === 'overview' ? 'Panel Principal' : 'Registro de Salida'}</h1>
            <p className="breadcrumb">Instituto Winston Churchill / {activeView === 'overview' ? 'Inicio' : 'Salida a Pie'}</p>
          </div>

          <div className="header-user">
            <div className="user-avatar">
              {alumno.alumno_nombre?.[0]}{alumno.alumno_app?.[0]}
            </div>
            <div className="user-info">
              <span className="user-name">{nombreCompleto}</span>
              <span className="user-role">{alumno.alumno_ref}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {activeView === 'overview' && (
            <div className="overview-grid">
              <div className="stat-card">
                <div className="stat-icon student">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Alumno</h3>
                  <p className="stat-value">{nombreCompleto}</p>
                  <p className="stat-label">Nombre completo</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon level">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Nivel Educativo</h3>
                  <p className="stat-value">{nivel}</p>
                  <p className="stat-label">Grado {alumno.alumno_grado}° - Grupo {alumno.alumno_grupo}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon control">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Número de Control</h3>
                  <p className="stat-value">{alumno.alumno_ref}</p>
                  <p className="stat-label">Identificador único</p>
                </div>
              </div>

              <div className="action-card" onClick={() => setActiveView('calendario')}>
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                </div>
                <h3>Registrar Nueva Salida</h3>
                <p>Programar fecha para salida a pie</p>
                <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          )}

          {activeView === 'calendario' && (
            <div className="calendario-section">
              <FormularioRegistro alumno={alumno} />
            </div>
          )}
        </div>
      </div>

      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>}
    </main>
  );
}
