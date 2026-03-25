'use client';

import React, { useState, useEffect } from 'react';
import { Alumno } from '@/types';

interface FormularioRegistroProps {
  alumno: Alumno;
}

type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes';

const DIAS_SEMANA: { value: DiaSemana; label: string; short: string }[] = [
  { value: 'lunes', label: 'Lunes', short: 'L' },
  { value: 'martes', label: 'Martes', short: 'M' },
  { value: 'miercoles', label: 'Miércoles', short: 'X' },
  { value: 'jueves', label: 'Jueves', short: 'J' },
  { value: 'viernes', label: 'Viernes', short: 'V' },
];

export default function FormularioRegistro({ alumno }: FormularioRegistroProps) {
  const [tipoRegistro, setTipoRegistro] = useState<'permanente' | 'eventual'>('permanente');
  const [diasSeleccionados, setDiasSeleccionados] = useState<DiaSemana[]>([]);
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

  const toggleDia = (dia: DiaSemana) => {
    if (diasSeleccionados.includes(dia)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== dia));
    } else {
      if (diasSeleccionados.length < 5) {
        setDiasSeleccionados([...diasSeleccionados, dia]);
      } else {
        setError('Máximo 5 días');
        setTimeout(() => setError(''), 3000);
      }
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

  const puedeModificar = () => {
    return true; // La validación se hará por día específico
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
    
    if (loading) return; // Prevenir múltiples submits
    
    // Validaciones específicas por tipo
    if (tipoRegistro === 'permanente') {
      if (diasSeleccionados.length === 0) {
        setError('Debe seleccionar al menos un día');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Verificar si alguno de los días seleccionados es HOY y es después de 1 PM
      const ahora = new Date();
      const diaSemanaHoy = ahora.toLocaleDateString('es-MX', { weekday: 'long' }).toLowerCase();
      const diaSemanaHoySinTildes = diaSemanaHoy.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      if (
        ahora.getHours() >= 13 &&
        (diasSeleccionados.includes(diaSemanaHoy as DiaSemana) ||
          diasSeleccionados.includes(diaSemanaHoySinTildes as DiaSemana))
      ) {
        setError(`No puede incluir ${diaSemanaHoy} después de la 1:00 PM del mismo día`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (tipoRegistro === 'eventual') {
      if (fechasEventuales.length === 0) {
        setError('Debe seleccionar al menos una fecha');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Verificar si alguna fecha es HOY y es después de 1 PM
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
    }

    setError('');
    setLoading(true);

    try {
      const data = {
        alumno_ref: alumno.alumno_ref,
        tipo_registro: tipoRegistro,
        dias_semana: tipoRegistro === 'permanente' ? diasSeleccionados : null,
        fechas: tipoRegistro === 'eventual' ? fechasEventuales.map(f => f.toISOString().split('T')[0]) : null,
      };

      const response = await fetch('/api/registro-salida/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('✅ Registro guardado');
        setDiasSeleccionados([]);
        setFechasEventuales([]);
        setMostrarFormulario(false);
        await cargarRegistros();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(result.error || 'Error al guardar');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError('Error al procesar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarDia = async (id: number, dia?: string) => {
    if (!dia) return;
    
    if (!puedeModificarDia(dia)) {
      setError(`No puede cancelar ${dia} después de la 1:00 PM del mismo día`);
      return;
    }

    if (loading) return; // Prevenir múltiples llamadas

    if (!confirm('¿Cancelar este día?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/registro-salida/cancelar-dia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, dia }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('✅ Día cancelado');
        await cargarRegistros();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Error al cancelar');
      }
    } catch (err) {
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

      {/* Registro Permanente Existente */}
      {registroPermanente && (
        <div className="registro-permanente-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">🔄 Registro Permanente Activo</h3>
              <p className="text-sm opacity-70 mt-1">
                Estos días se repiten cada semana de todos los meses
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold">
                Cancelaciones usadas: {registroPermanente.cancelaciones_usadas || 0}/5
              </span>
              <p className="text-xs opacity-60 mt-1">
                Puedes cancelar hasta 5 días individuales
              </p>
            </div>
          </div>
          <div className="dias-permanente-display">
            {registroPermanente.dias_semana?.map((dia: string) => {
              const diaLabel = dia.charAt(0).toUpperCase() + dia.slice(1);
              return (
                <div key={dia} className="dia-permanente-item-mejorado">
                  <span className="dia-label-permanent-grande">{diaLabel}</span>
                  {(registroPermanente.cancelaciones_usadas || 0) < 5 ? (
                    <button
                      onClick={() => {
                        if (confirm(`¿Cancelar "${diaLabel}" permanentemente?\n\nEsto contará como 1 de tus 5 cancelaciones permitidas.`)) {
                          handleCancelarDia(registroPermanente.id, dia);
                        }
                      }}
                      className="btn-cancelar-dia-mejorado"
                      disabled={loading}
                      title="Cancelar este día"
                    >
                      🗑️ Cancelar
                    </button>
                  ) : (
                    <span className="text-xs opacity-50">Sin cancelaciones</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-sm">
              ℹ️ <strong>Nota:</strong> Este registro se aplica automáticamente cada semana. 
              Si necesitas cancelar un día específico, usa el botón "Cancelar" (límite: 5 cancelaciones).
            </p>
          </div>
        </div>
      )}

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

      {/* Botón Nuevo */}
      {!mostrarFormulario && !registroPermanente && (
        <div className="text-center">
          <button onClick={() => setMostrarFormulario(true)} className="btn-nuevo">
            ✨ Nuevo Registro
          </button>
        </div>
      )}

      {/* Mensaje cuando ya hay permanente */}
      {!mostrarFormulario && registroPermanente && (
        <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
          <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ Ya tienes un registro permanente activo
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            Este registro se aplica automáticamente cada semana de todos los meses. 
            Si necesitas agregar días eventuales específicos, usa el botón de abajo.
          </p>
          <button 
            onClick={() => {
              setTipoRegistro('eventual');
              setMostrarFormulario(true);
            }} 
            className="btn-agregar-eventual"
          >
            📅 Agregar Día Eventual
          </button>
        </div>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="formulario-card">
          <div className="tipo-selector-tabs">
            {!registroPermanente && (
              <button
                onClick={() => setTipoRegistro('permanente')}
                className={`tipo-tab ${tipoRegistro === 'permanente' ? 'active' : ''}`}
              >
                🔄 Permanente
              </button>
            )}
            <button
              onClick={() => setTipoRegistro('eventual')}
              className={`tipo-tab ${tipoRegistro === 'eventual' ? 'active' : ''}`}
            >
              📅 Eventual
            </button>
          </div>

          <form onSubmit={handleSubmit} className="form-content">
            {tipoRegistro === 'permanente' ? (
              registroPermanente ? (
                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-700">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                    ⚠️ Ya existe un registro permanente
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    Solo puedes tener un registro permanente activo. Usa la opción "Eventual" para días específicos.
                  </p>
                </div>
              ) : (
                <div className="dias-permanente-selector">
                  <h4 className="selector-title">Días de la semana (máx. 5)</h4>
                  <div className="dias-inline">
                    {DIAS_SEMANA.map(({ value, label, short }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleDia(value)}
                        className={`dia-inline-btn ${diasSeleccionados.includes(value) ? 'selected' : ''}`}
                        title={label}
                      >
                        <span className="dia-full">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            ) : (
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
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setDiasSeleccionados([]);
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
