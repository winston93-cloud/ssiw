'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false); // Cerrado por defecto
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Colapsado por defecto
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);
  const [familiares, setFamiliares] = useState<any[]>([]);
  const [loadingFamiliares, setLoadingFamiliares] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const maestraData = localStorage.getItem('maestra');
    if (!maestraData) {
      router.push('/login');
    } else {
      setMaestra(JSON.parse(maestraData));
      cargarAlumnos(new Date().toISOString().split('T')[0]);
    }
  }, [router]);

  const cargarAlumnos = async (fecha: string = fechaSeleccionada) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/entrega/alumnos-del-dia?fecha=${encodeURIComponent(fecha)}`);
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

  const handleFechaCambio = (e: ChangeEvent<HTMLInputElement>) => {
    const nuevaFecha = e.target.value;
    setFechaSeleccionada(nuevaFecha);
    cargarAlumnos(nuevaFecha);
  };

  const handleToggleEntrega = async (alumno_ref: string, yaEntregado: boolean) => {
    if (!maestra) return;

    setRegistrando(alumno_ref);
    try {
      const endpoint = yaEntregado ? '/api/entrega/deshacer' : '/api/entrega/registrar';
      const body = yaEntregado 
        ? { alumno_ref, fecha: fechaSeleccionada }
        : { alumno_ref, maestra_id: maestra.id, maestra_nombre: maestra.nombre, fecha: fechaSeleccionada };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        await cargarAlumnos();
      }
    } catch (error) {
      console.error('Error al toggle entrega:', error);
    } finally {
      setRegistrando(null);
    }
  };

  const handleVerFamiliares = async (alumno: Alumno) => {
    setAlumnoSeleccionado(alumno);
    setLoadingFamiliares(true);
    
    try {
      const response = await fetch(`/api/familiares/${alumno.alumno_ref}`);
      const data = await response.json();
      
      if (data.success) {
        setFamiliares(data.familiares || []);
      }
    } catch (error) {
      console.error('Error al cargar familiares:', error);
      setFamiliares([]);
    } finally {
      setLoadingFamiliares(false);
    }
  };

  const cerrarModal = () => {
    setAlumnoSeleccionado(null);
    setFamiliares([]);
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

          {/* Día actual destacado */}
          <div className="header-fecha-destacada">
            {(() => {
              const fechaObj = new Date(`${fechaSeleccionada}T12:00:00`);
              const diaNumero = fechaObj.getDate();
              const diaSemana = fechaObj.toLocaleDateString('es-MX', { weekday: 'long' });
              const mesAnio = fechaObj.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
              return (
                <>
                  <div className="fecha-dia-numero">{diaNumero}</div>
                  <div className="fecha-dia-texto">
                    <div className="fecha-dia-semana">{diaSemana}</div>
                    <div className="fecha-mes-anio">{mesAnio}</div>
                  </div>

                  <div className="fecha-cambiador">
                    <label className="fecha-cambiador-label" htmlFor="fecha-selector">
                      Cambiar
                    </label>
                    <input
                      id="fecha-selector"
                      className="fecha-cambiador-input"
                      type="date"
                      value={fechaSeleccionada}
                      onChange={handleFechaCambio}
                    />
                  </div>
                </>
              );
            })()}
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
                  <div 
                    className="alumno-info clickeable"
                    onClick={() => handleVerFamiliares(alumno)}
                    title="Ver familiares autorizados"
                  >
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
                    <button
                      onClick={() => handleToggleEntrega(alumno.alumno_ref, alumno.entregado)}
                      disabled={registrando === alumno.alumno_ref}
                      className={alumno.entregado ? "btn-deshacer" : "btn-entregar"}
                    >
                      {registrando === alumno.alumno_ref ? (
                        <>
                          <div className="spinner-small"></div>
                          {alumno.entregado ? 'Deshaciendo...' : 'Registrando...'}
                        </>
                      ) : alumno.entregado ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                          </svg>
                          Deshacer Entrega
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
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>}

      {/* Modal de Familiares Autorizados */}
      {alumnoSeleccionado && (
        <div className="modal-familiares-overlay" onClick={cerrarModal}>
          <div className="modal-familiares-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={cerrarModal}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div className="modal-familiares-header">
              <div className="modal-alumno-avatar">
                {alumnoSeleccionado.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="modal-alumno-nombre">{alumnoSeleccionado.nombre_completo}</h2>
                <div className="modal-alumno-info">
                  <span className="modal-badge">{alumnoSeleccionado.nivel_educativo}</span>
                  <span className="modal-divider">•</span>
                  <span className="modal-badge">{alumnoSeleccionado.grado}</span>
                  {alumnoSeleccionado.grupo && (
                    <>
                      <span className="modal-divider">•</span>
                      <span>Grupo {alumnoSeleccionado.grupo}</span>
                    </>
                  )}
                  <span className="modal-divider">•</span>
                  <span>#{alumnoSeleccionado.alumno_ref}</span>
                </div>
              </div>
            </div>

            <div className="modal-familiares-body">
              <h3 className="modal-section-title">👥 Personas Autorizadas</h3>
              
              {loadingFamiliares ? (
                <div className="modal-loading">
                  <div className="spinner-large"></div>
                  <p>Cargando familiares...</p>
                </div>
              ) : familiares.length === 0 ? (
                <div className="modal-empty">
                  <svg className="empty-icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <p className="modal-empty-text">No hay familiares autorizados registrados</p>
                </div>
              ) : (
                <div className="modal-familiares-list">
                  {familiares.map((familiar, index) => (
                    <div key={familiar.familiar_id} className="modal-familiar-card">
                      <div className="modal-familiar-numero">{index + 1}</div>
                      <div className="modal-familiar-info">
                        <div className="modal-familiar-nombre-row">
                          <h4 className="modal-familiar-nombre">
                            {familiar.familiar_nombre} {familiar.familiar_app} {familiar.familiar_apm}
                          </h4>
                          {familiar.tutor_id === 1 && (
                            <span className="modal-badge-tutor1">👤 Tutor 1</span>
                          )}
                          {familiar.tutor_id === 2 && (
                            <span className="modal-badge-tutor2">👤 Tutor 2</span>
                          )}
                        </div>
                        <div className="modal-familiar-contactos">
                          {familiar.familiar_tel && (
                            <div className="modal-contacto">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                              </svg>
                              <span>{familiar.familiar_tel}</span>
                            </div>
                          )}
                          {familiar.familiar_cel && (
                            <div className="modal-contacto">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                              </svg>
                              <span>{familiar.familiar_cel}</span>
                            </div>
                          )}
                          {familiar.familiar_email && (
                            <div className="modal-contacto">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                              </svg>
                              <span>{familiar.familiar_email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
