'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Alumno } from '@/types';
import {
  DIAS_SEMANA_PIE,
  diasSemanaNormalizados,
  type DiaSemanaPie,
} from '@/lib/dias-semana-pie';

interface FormularioRegistroProps {
  alumno: Alumno;
}

export default function FormularioRegistro({ alumno }: FormularioRegistroProps) {
  const [fechasEventuales, setFechasEventuales] = useState<Date[]>([]);
  const [registroPermanente, setRegistroPermanente] = useState<any>(null);
  const [registrosEventuales, setRegistrosEventuales] = useState<any[]>([]);
  const [familiares, setFamiliares] = useState<any[]>([]);
  const [alumnoId, setAlumnoId] = useState<number | null>(null);
  const [mostrarFormFamiliar, setMostrarFormFamiliar] = useState(false);
  const [familiarEditando, setFamiliarEditando] = useState<any>(null);
  const [formFamiliar, setFormFamiliar] = useState({
    familiar_nombre: '',
    familiar_app: '',
    familiar_apm: '',
    familiar_tel: '',
    familiar_cel: '',
    familiar_email: '',
    tutor_id: 0
  });
  const [loading, setLoading] = useState(false);
  const [loadingRegistros, setLoadingRegistros] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mesActual, setMesActual] = useState(new Date());

  useEffect(() => {
    cargarRegistros();
    cargarFamiliares();
  }, [alumno.alumno_ref]);

  const cargarRegistros = async () => {
    setLoadingRegistros(true);
    try {
      const response = await fetch(`/api/registro-salida/mis-registros/${alumno.alumno_ref}`);
      const data = await response.json();
      if (data.success) {
        const permanente = data.data?.find((r: any) => r.tipo_registro === 'permanente');
        const eventuales = data.data?.filter((r: any) => r.tipo_registro === 'eventual') || [];
        setRegistroPermanente(permanente || null);
        setRegistrosEventuales(eventuales);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingRegistros(false);
    }
  };

  const cargarFamiliares = async () => {
    try {
      const response = await fetch(`/api/familiares/${alumno.alumno_ref}`);
      const data = await response.json();
      if (data.success) {
        setFamiliares(data.familiares || []);
        setAlumnoId(data.alumno_id);
      }
    } catch (error) {
      console.error('Error cargando familiares:', error);
    }
  };

  const toggleFecha = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    const existe = fechasEventuales.find(f => f.toISOString().split('T')[0] === fechaStr);
    
    if (existe) {
      setFechasEventuales(fechasEventuales.filter(f => f.toISOString().split('T')[0] !== fechaStr));
    } else {
      setFechasEventuales([...fechasEventuales, fecha]);
    }
  };

  const puedeModificarDia = (dia: string) => {
    const ahora = new Date();
    const diaSemanaHoy = ahora.toLocaleDateString('es-MX', { weekday: 'long' }).toLowerCase();
    const diaSemanaHoySinTildes = diaSemanaHoy.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const horaActual = ahora.getHours();
    
    // Si es después de la 1 PM y el día es hoy, NO puede modificar
    if (horaActual >= 13 && (dia === diaSemanaHoy || dia === diaSemanaHoySinTildes)) {
      return false;
    }
    
    return true;
  };

  const puedeModificarFecha = (fecha: string) => {
    const ahora = new Date();
    const fechaHoy = ahora.toISOString().split('T')[0];
    const horaActual = ahora.getHours();
    
    // Si es después de la 1 PM y la fecha es hoy, NO puede modificar
    if (horaActual >= 13 && fecha === fechaHoy) {
      return false;
    }
    
    return true;
  };

  const getDiasDelMes = () => {
    const anio = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    
    const dias: (Date | null)[] = [];
    
    for (let i = 0; i < primerDia.getDay(); i++) {
      dias.push(null);
    }
    
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(anio, mes, dia));
    }
    
    return dias;
  };

  const esFechaValida = (fecha: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // No permitir fechas pasadas
    if (fecha < hoy) return false;
    
    // Límite máximo: 15 días hacia adelante
    const limiteMaximo = new Date(hoy);
    limiteMaximo.setDate(hoy.getDate() + 15);
    if (fecha > limiteMaximo) return false;
    
    // Solo días entre semana (L-V)
    const diaSemana = fecha.getDay();
    return diaSemana !== 0 && diaSemana !== 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (fechasEventuales.length === 0) {
      setError('Debe seleccionar al menos una fecha');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const ahora = new Date();
    const fechaHoy = ahora.toISOString().split('T')[0];
    
    if (ahora.getHours() >= 13) {
      const incluyeHoy = fechasEventuales.some(
        f => f.toISOString().split('T')[0] === fechaHoy
      );
      
      if (incluyeHoy) {
        setError('No puede incluir el día de hoy después de la 1:00 PM');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      const data = {
        alumno_ref: alumno.alumno_ref,
        tipo_registro: 'eventual' as const,
        dias_semana: null,
        fechas: fechasEventuales.map(f => f.toISOString().split('T')[0]),
      };

      const response = await fetch('/api/registro-salida/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('✅ Registro guardado');
        setFechasEventuales([]);
        setMostrarFormulario(false);
        await cargarRegistros();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(result.error || 'Error al guardar');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      setError('Error al procesar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const diasActivosPermanente = useMemo(
    () => new Set(diasSemanaNormalizados(registroPermanente?.dias_semana)),
    [registroPermanente]
  );

  const handleToggleDiaPermanente = async (dia: DiaSemanaPie, activar: boolean) => {
    if (!activar && !puedeModificarDia(dia)) {
      setError(`No puede desactivar ${dia} después de la 1:00 PM del mismo día`);
      return;
    }
    if (activar && !puedeModificarDia(dia)) {
      setError(`No puede activar ${dia} después de la 1:00 PM del mismo día`);
      return;
    }

    if (loading) return;

    if (
      !activar &&
      (registroPermanente?.cancelaciones_usadas || 0) >= 5
    ) {
      setError('Ya usó las 5 cancelaciones permitidas.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/registro-salida/toggle-dia-permanente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_ref: alumno.alumno_ref,
          dia,
          accion: activar ? 'activar' : 'desactivar',
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(activar ? `✅ ${dia} activado` : `✅ ${dia} desactivado`);
        await cargarRegistros();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Error al actualizar el día');
      }
    } catch {
      setError('Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarFechaEventual = async (id: number, fecha: string) => {
    if (!puedeModificarFecha(fecha)) {
      const fechaObj = new Date(fecha + 'T12:00:00');
      const fechaFormateada = fechaObj.toLocaleDateString('es-MX', { 
        day: 'numeric', 
        month: 'long' 
      });
      setError(`No puede cancelar ${fechaFormateada} después de la 1:00 PM del mismo día`);
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/registro-salida/cancelar-fecha-eventual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, fecha }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('✅ Fecha eliminada');
        await cargarRegistros();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Error al eliminar fecha');
      }
    } catch (err) {
      setError('Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  const cambiarMes = (direccion: number) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + direccion, 1));
  };

  const handleAgregarFamiliar = () => {
    setFamiliarEditando(null);
    setFormFamiliar({
      familiar_nombre: '',
      familiar_app: '',
      familiar_apm: '',
      familiar_tel: '',
      familiar_cel: '',
      familiar_email: '',
      tutor_id: 0
    });
    setMostrarFormFamiliar(true);
  };

  const handleEditarFamiliar = (familiar: any) => {
    setFamiliarEditando(familiar);
    setFormFamiliar({
      familiar_nombre: familiar.familiar_nombre || '',
      familiar_app: familiar.familiar_app || '',
      familiar_apm: familiar.familiar_apm || '',
      familiar_tel: familiar.familiar_tel || '',
      familiar_cel: familiar.familiar_cel || '',
      familiar_email: familiar.familiar_email || '',
      tutor_id: familiar.tutor_id || 0
    });
    setMostrarFormFamiliar(true);
  };

  const handleGuardarFamiliar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formFamiliar.familiar_nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      const endpoint = familiarEditando 
        ? '/api/familiares/actualizar'
        : '/api/familiares/crear';
      
      const body = familiarEditando
        ? { ...formFamiliar, familiar_id: familiarEditando.familiar_id }
        : { ...formFamiliar, alumno_id: alumnoId };

      const response = await fetch(endpoint, {
        method: familiarEditando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(familiarEditando ? '✅ Familiar actualizado' : '✅ Familiar agregado');
        setMostrarFormFamiliar(false);
        await cargarFamiliares();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Error al guardar');
      }
    } catch (err) {
      setError('Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarFamiliar = async (familiar_id: number) => {
    if (!confirm('¿Eliminar este familiar autorizado?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/familiares/eliminar?familiar_id=${familiar_id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('✅ Familiar eliminado');
        await cargarFamiliares();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Error al eliminar');
      }
    } catch (err) {
      setError('Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRegistros) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="loading-spinner-modern mb-6"></div>
        <p className="text-sm font-medium opacity-60">Cargando...</p>
      </div>
    );
  }

  const nombreMes = mesActual.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  return (
    <div className="registro-container">
      {success && <div className="alert-success">{success}</div>}
      {error && (
        <div className="alert-error">
          ⚠️ {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {/* Registro Permanente — siempre 5 días L–V */}
      <div className="registro-permanente-card">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-bold">🔄 Registro Permanente</h3>
            <p className="text-sm opacity-70 mt-1">
              Activa o desactiva cada día. Solo los días activos se envían a las maestras auxiliares.
            </p>
          </div>
          {registroPermanente && (
            <div className="text-right">
              <span className="text-sm font-semibold">
                Cancelaciones usadas: {registroPermanente.cancelaciones_usadas || 0}/5
              </span>
              <p className="text-xs opacity-60 mt-1">
                Desactivar un día cuenta como cancelación
              </p>
            </div>
          )}
        </div>

        <div className="dias-permanente-grid">
          {DIAS_SEMANA_PIE.map(({ value, label }) => {
            const activo = diasActivosPermanente.has(value);
            const sinCancelaciones =
              (registroPermanente?.cancelaciones_usadas || 0) >= 5;
            const puedeToggle = activo
              ? !sinCancelaciones && puedeModificarDia(value)
              : puedeModificarDia(value);

            return (
              <div
                key={value}
                className={`dia-permanente-toggle ${activo ? 'dia-permanente-activo' : 'dia-permanente-inactivo'}`}
              >
                <span className="dia-permanente-nombre">{label}</span>
                <span className={`dia-permanente-estado ${activo ? 'estado-activo' : 'estado-inactivo'}`}>
                  {activo ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!puedeToggle) return;
                    if (!activo) {
                      handleToggleDiaPermanente(value, true);
                      return;
                    }
                    if (
                      confirm(
                        `¿Desactivar ${label}?\n\nEsto contará como 1 de tus 5 cancelaciones permitidas.`
                      )
                    ) {
                      handleToggleDiaPermanente(value, false);
                    }
                  }}
                  className={`btn-toggle-dia ${activo ? 'btn-desactivar-dia' : 'btn-activar-dia'}`}
                  disabled={loading || !puedeToggle}
                  title={
                    !puedeToggle && activo && sinCancelaciones
                      ? 'Sin cancelaciones disponibles'
                      : !puedeToggle
                        ? 'No se puede modificar después de la 1:00 PM del mismo día'
                        : activo
                          ? 'Desactivar este día'
                          : 'Activar este día'
                  }
                >
                  {activo ? '✕ Cancelar' : '✓ Activar'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-sm">
            ℹ️ Los días activos se repiten cada semana. Puedes activar o desactivar cualquier día en cualquier momento (límite: 5 desactivaciones).
          </p>
        </div>
      </div>

      {/* Registros Eventuales */}
      {registrosEventuales.length > 0 && (
        <div className="registros-eventuales-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">📅 Días Eventuales</h3>
              <p className="text-sm opacity-70 mt-1">
                Días específicos para salida a pie
              </p>
            </div>
          </div>
          <div className="fechas-eventuales-grid-mejorado">
            {registrosEventuales.map((registro) => (
              registro.fechas_especificas?.map((fecha: string) => {
                const fechaObj = new Date(fecha + 'T12:00:00');
                const fechaFormateada = fechaObj.toLocaleDateString('es-MX', { 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                });
                return (
                  <div key={`${registro.id}-${fecha}`} className="fecha-eventual-item-mejorado">
                    <span className="fecha-label-grande">
                      {fechaObj.toLocaleDateString('es-MX', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el día ${fechaFormateada}?`)) {
                          handleCancelarFechaEventual(registro.id, fecha);
                        }
                      }}
                      className="btn-cancelar-dia-mejorado"
                      disabled={loading}
                      title="Eliminar esta fecha"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                );
              })
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-sm">
              ℹ️ <strong>Nota:</strong> Estos son días específicos que has seleccionado. 
              Puedes eliminarlos individualmente usando el botón "Eliminar".
            </p>
          </div>
        </div>
      )}

      {/* Botón agregar día eventual */}
      {!mostrarFormulario && (
        <div className="text-center">
          <button
            onClick={() => setMostrarFormulario(true)}
            className="btn-agregar-eventual"
          >
            📅 Agregar Día Eventual
          </button>
        </div>
      )}

      {/* Formulario eventual */}
      {mostrarFormulario && (
        <div className="formulario-card">
          <h3 className="text-lg font-bold mb-4">📅 Día Eventual</h3>

          <form onSubmit={handleSubmit} className="form-content">
            <div className="calendario-eventual">
                <div className="calendario-header">
                  <button type="button" onClick={() => cambiarMes(-1)} className="calendario-nav">
                    ←
                  </button>
                  <h4 className="calendario-mes">{nombreMes}</h4>
                  <button type="button" onClick={() => cambiarMes(1)} className="calendario-nav">
                    →
                  </button>
                </div>

                <div className="calendario-grid">
                  <div className="calendario-dias-semana">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => (
                      <div key={d} className="dia-semana-header">{d}</div>
                    ))}
                  </div>
                  <div className="calendario-dias">
                    {getDiasDelMes().map((fecha, index) => {
                      if (!fecha) return <div key={`empty-${index}`} className="calendario-dia-vacio" />;
                      
                      const valida = esFechaValida(fecha);
                      const seleccionada = fechasEventuales.find(
                        f => f.toISOString().split('T')[0] === fecha.toISOString().split('T')[0]
                      );

                      return (
                        <button
                          key={fecha.toISOString()}
                          type="button"
                          onClick={() => valida && toggleFecha(fecha)}
                          disabled={!valida}
                          className={`calendario-dia ${seleccionada ? 'selected' : ''} ${!valida ? 'disabled' : ''}`}
                        >
                          {fecha.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-sm text-center mt-3 opacity-60">
                  {fechasEventuales.length} {fechasEventuales.length === 1 ? 'día seleccionado' : 'días seleccionados'}
                </p>
              </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setFechasEventuales([]);
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="btn-guardar">
                {loading ? '⏳ Guardando...' : '💾 Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sección de Familiares Autorizados */}
      <div className="familiares-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">👥 Familiares Autorizados</h3>
            <p className="text-sm opacity-70 mt-1">
              Personas autorizadas para recoger al alumno
            </p>
          </div>
          <button onClick={handleAgregarFamiliar} className="btn-nuevo-familiar">
            ➕ Agregar Familiar
          </button>
        </div>

        {familiares.length === 0 ? (
          <div className="empty-familiares">
            <p>No hay familiares autorizados registrados</p>
          </div>
        ) : (
          <div className="familiares-grid">
            {familiares.map((familiar) => (
              <div key={familiar.familiar_id} className="familiar-card">
                <div className="familiar-info">
                  <h4 className="familiar-nombre">
                    {familiar.familiar_nombre} {familiar.familiar_app} {familiar.familiar_apm}
                  </h4>
                  {familiar.tutor_id === 1 && (
                    <span className="badge-tutor1">👤 Tutor 1</span>
                  )}
                  {familiar.tutor_id === 2 && (
                    <span className="badge-tutor2">👤 Tutor 2</span>
                  )}
                  {familiar.familiar_tel && (
                    <p className="familiar-dato">📞 {familiar.familiar_tel}</p>
                  )}
                  {familiar.familiar_cel && (
                    <p className="familiar-dato">📱 {familiar.familiar_cel}</p>
                  )}
                  {familiar.familiar_email && (
                    <p className="familiar-dato">✉️ {familiar.familiar_email}</p>
                  )}
                </div>
                <div className="familiar-actions">
                  <button
                    onClick={() => handleEditarFamiliar(familiar)}
                    className="btn-editar-familiar"
                    disabled={loading}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleEliminarFamiliar(familiar.familiar_id)}
                    className="btn-eliminar-familiar"
                    disabled={loading}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal/Form para agregar/editar familiar */}
        {mostrarFormFamiliar && (
          <div className="modal-overlay" onClick={() => setMostrarFormFamiliar(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">
                {familiarEditando ? '✏️ Editar Familiar' : '➕ Agregar Familiar'}
              </h3>
              <form onSubmit={handleGuardarFamiliar} className="form-familiar">
                <div className="form-group">
                  <label>Nombre(s) *</label>
                  <input
                    type="text"
                    value={formFamiliar.familiar_nombre}
                    onChange={(e) => setFormFamiliar({...formFamiliar, familiar_nombre: e.target.value})}
                    required
                    className="input-familiar"
                  />
                </div>
                <div className="form-group">
                  <label>Apellido Paterno</label>
                  <input
                    type="text"
                    value={formFamiliar.familiar_app}
                    onChange={(e) => setFormFamiliar({...formFamiliar, familiar_app: e.target.value})}
                    className="input-familiar"
                  />
                </div>
                <div className="form-group">
                  <label>Apellido Materno</label>
                  <input
                    type="text"
                    value={formFamiliar.familiar_apm}
                    onChange={(e) => setFormFamiliar({...formFamiliar, familiar_apm: e.target.value})}
                    className="input-familiar"
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formFamiliar.familiar_tel}
                    onChange={(e) => setFormFamiliar({...formFamiliar, familiar_tel: e.target.value})}
                    className="input-familiar"
                  />
                </div>
                <div className="form-group">
                  <label>Celular</label>
                  <input
                    type="tel"
                    value={formFamiliar.familiar_cel}
                    onChange={(e) => setFormFamiliar({...formFamiliar, familiar_cel: e.target.value})}
                    className="input-familiar"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formFamiliar.familiar_email}
                    onChange={(e) => setFormFamiliar({...formFamiliar, familiar_email: e.target.value})}
                    className="input-familiar"
                  />
                </div>
                <div className="form-group">
                  <label>Relación con el alumno</label>
                  <select
                    value={formFamiliar.tutor_id}
                    onChange={(e) => setFormFamiliar({...formFamiliar, tutor_id: parseInt(e.target.value)})}
                    className="input-familiar"
                  >
                    <option value={0}>Familiar autorizado</option>
                    <option value={1}>👤 Tutor 1</option>
                    <option value={2}>👤 Tutor 2</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setMostrarFormFamiliar(false)}
                    className="btn-cancelar"
                  >
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="btn-guardar">
                    {loading ? '⏳ Guardando...' : '💾 Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
