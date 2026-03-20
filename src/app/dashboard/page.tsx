'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alumno, getNivelEducativo } from '@/types';
import FormularioRegistro from '@/components/registro/FormularioRegistro';

export default function DashboardPage() {
  const router = useRouter();
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [maestra, setMaestra] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'calendario'>('overview');
  const [menuOpen, setMenuOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Siempre colapsado por defecto

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const alumnoData = localStorage.getItem('alumno');
    const maestraData = localStorage.getItem('maestra');
    
    if (maestraData) {
      setMaestra(JSON.parse(maestraData));
    } else if (alumnoData) {
      setAlumno(JSON.parse(alumnoData));
    } else {
      router.push('/login');
    }
  }, [mounted, router]);

  const handleLogout = () => {
    localStorage.removeItem('alumno');
    localStorage.removeItem('maestra');
    router.push('/login');
  };

  if (!mounted || (!alumno && !maestra)) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando sistema...</p>
      </div>
    );
  }

  const nombreCompleto = maestra 
    ? maestra.nombre 
    : (alumno?.alumno_nombre_completo || 
      `${alumno?.alumno_nombre} ${alumno?.alumno_app} ${alumno?.alumno_apm}`);
  const nivel = alumno ? getNivelEducativo(alumno.alumno_nivel) : '';

  return (
    <main className="dashboard">
      <aside className={`sidebar ${menuOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M24 4L6 14V22C6 32 12 40.5 24 44C36 40.5 42 32 42 22V14L24 4Z" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
          </div>
          {!sidebarCollapsed && <h2>SSIW</h2>}
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expandir' : 'Colapsar'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {sidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              )}
            </svg>
          </button>
          <button className="sidebar-close" onClick={() => setMenuOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => { 
              if (sidebarCollapsed) {
                setSidebarCollapsed(false);
              }
              setActiveView('overview'); 
              setMenuOpen(false); 
            }}
            title={sidebarCollapsed ? 'Inicio' : ''}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            {!sidebarCollapsed && <span>Inicio</span>}
          </button>

          <button
            className={`nav-item ${activeView === 'calendario' ? 'active' : ''}`}
            onClick={() => { 
              if (sidebarCollapsed) {
                setSidebarCollapsed(false);
              }
              setActiveView('calendario'); 
              setMenuOpen(false); 
            }}
            title={sidebarCollapsed ? 'Registro de Salida' : ''}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {!sidebarCollapsed && <span>Registro de Salida</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="nav-item logout" 
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
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
              {maestra 
                ? maestra.nombre.substring(0, 2).toUpperCase()
                : `${alumno?.alumno_nombre?.[0]}${alumno?.alumno_app?.[0]}`
              }
            </div>
            <div className="user-info">
              <span className="user-name">{nombreCompleto}</span>
              <span className="user-role">{maestra ? maestra.id : alumno?.alumno_ref}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {activeView === 'overview' && (
            <div className="overview-single-left">
              {/* Tarjeta para PADRES */}
              {alumno && (
                <div className="action-card-large" onClick={() => setActiveView('calendario')}>
                  <div className="action-icon-large">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h3>Registro de Salida</h3>
                  <p>Registre la salida a pie de sus hijos</p>
                  <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              )}

              {/* Tarjeta para MAESTRAS */}
              {maestra && (
                <div className="action-card-large" onClick={() => router.push('/entrega/dashboard')}>
                  <div className="action-icon-large">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3>Entrega a Pie</h3>
                  <p>Registre la entrega de alumnos</p>
                  <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              )}
            </div>
          )}

          {activeView === 'calendario' && alumno && (
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
