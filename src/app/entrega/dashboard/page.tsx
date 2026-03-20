'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Alumno {
  alumno_ref: string;
  nombre_completo: string;
  grado: string;
  grupo: string;
  nivel_educativo: string;
  tipo_registro: string;
  entregado: boolean;
}

interface DatosDelDia {
  fecha: string;
  dia: string;
  total: number;
  entregados: number;
  pendientes: number;
  alumnos: Alumno[];
}

export default function EntregaDashboardPage() {
  const router = useRouter();
  const [maestra, setMaestra] = useState<any>(null);
  const [datos, setDatos] = useState<DatosDelDia | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [nivelFiltro, setNivelFiltro] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Colapsado por defecto

  useEffect(() => {
    const maestraData = localStorage.getItem('maestra');
    if (!maestraData) {
      router.push('/login');
    } else {
      setMaestra(JSON.parse(maestraData));
      cargarAlumnos();
    }
  }, [router]);

  const cargarAlumnos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/entrega/alumnos-del-dia');
      const data = await response.json();
      if (data.success) {
        setDatos(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntregar = async (alumno_ref: string, nombre: string) => {
    if (!maestra) return;
    
    if (!confirm(`¿Confirmar entrega de ${nombre}?`)) return;

    setRegistrando(alumno_ref);
    try {
      const response = await fetch('/api/entrega/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_ref,
          maestra_id: maestra.id,
          maestra_nombre: maestra.nombre
        })
      });

      const data = await response.json();
      if (data.success) {
        await cargarAlumnos();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al registrar entrega');
    } finally {
      setRegistrando(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('maestra');
    router.push('/login');
  };

  const alumnosFiltrados = datos?.alumnos.filter(a => {
    // Filtro de búsqueda
    const matchBusqueda = a.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.alumno_ref.includes(busqueda) ||
      `${a.grado}${a.grupo}`.toLowerCase().includes(busqueda.toLowerCase());
    
    // Filtro de nivel
    const matchNivel = nivelFiltro === 'Todos' || a.nivel_educativo === nivelFiltro;
    
    return matchBusqueda && matchNivel;
  }) || [];

  if (loading || !maestra) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando sistema...</p>
      </div>
    );
  }

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
            className="nav-item active"
            title="Entrega a Pie"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {!sidebarCollapsed && <span>Entrega a Pie</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={handleLogout} title="Cerrar Sesión">
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
            <h1>Entrega a Pie</h1>
            <p className="breadcrumb">Instituto Winston Churchill / Control de Entregas</p>
          </div>

          {/* Estadísticas compactas en header */}
          <div className="stats-cards-header">
            <div className="stat-card-header stat-primary">
              <div className="stat-value-header">{datos?.total || 0}</div>
              <div className="stat-label-header">Total</div>
            </div>
            <div className="stat-card-header stat-success">
              <div className="stat-value-header">{datos?.entregados || 0}</div>
              <div className="stat-label-header">Entregados</div>
            </div>
            <div className="stat-card-header stat-warning">
              <div className="stat-value-header">{datos?.pendientes || 0}</div>
              <div className="stat-label-header">Pendientes</div>
            </div>
          </div>

          <div className="header-user">
            <div className="user-avatar">
              {maestra.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{maestra.nombre}</span>
              <span className="user-role">{maestra.id}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Filtro de nivel y búsqueda en la misma línea */}
          <div className="controles-top">
            <div className="nivel-filtro-container">
              <label htmlFor="nivel-filtro" className="nivel-filtro-label">Nivel:</label>
              <select 
                id="nivel-filtro"
                value={nivelFiltro}
                onChange={(e) => setNivelFiltro(e.target.value)}
                className="nivel-filtro-select"
              >
                <option value="Todos">Todos</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
            </div>

            {/* Barra de búsqueda */}
            <div className="search-bar-large">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, matrícula o grado..."
                className="search-input-large"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Lista de alumnos */}
          <div className="entregas-list">
            {alumnosFiltrados.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3>{busqueda ? 'Sin resultados' : 'No hay entregas pendientes'}</h3>
                <p>{busqueda ? 'Intenta con otro término de búsqueda' : 'Todos los alumnos han sido entregados'}</p>
              </div>
            ) : (
              alumnosFiltrados.map((alumno) => (
                <div
                  key={alumno.alumno_ref}
                  className={`alumno-card ${alumno.entregado ? 'entregado' : ''}`}
                >
                  <div className="alumno-info">
                    <div className="alumno-avatar">
                      {alumno.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </div>
                    <div className="alumno-details">
                      <h3 className="alumno-nombre">{alumno.nombre_completo}</h3>
                      <div className="alumno-meta">
                        <span className="meta-badge">{alumno.nivel_educativo}</span>
                        <span className="meta-divider">•</span>
                        <span className="meta-badge">{alumno.grado}</span>
                        {alumno.grupo && (
                          <>
                            <span className="meta-divider">•</span>
                            <span className="meta-text">Grupo {alumno.grupo}</span>
                          </>
                        )}
                        <span className="meta-divider">•</span>
                        <span className="meta-text">#{alumno.alumno_ref}</span>
                      </div>
                    </div>
                  </div>

                  <div className="alumno-actions">
                    {alumno.entregado ? (
                      <div className="status-badge status-success">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Entregado
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEntregar(alumno.alumno_ref, alumno.nombre_completo)}
                        disabled={registrando === alumno.alumno_ref}
                        className="btn-entregar"
                      >
                        {registrando === alumno.alumno_ref ? (
                          <>
                            <div className="spinner-small"></div>
                            Registrando...
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Entregar Alumno
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>}
    </main>
  );
}
