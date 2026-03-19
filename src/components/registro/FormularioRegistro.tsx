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
  const [loading, setLoading] = useState(false);
  const [loadingRegistros, setLoadingRegistros] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mesActual, setMesActual] = useState(new Date());

  useEffect(() => {
    cargarRegistros();
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
    // const ahora = new Date();
    // return ahora.getHours() < 13;
    return true; // Temporalmente sin restricción
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
    
    if (fecha < hoy) return false;
    
    const diaSemana = fecha.getDay();
    return diaSemana !== 0 && diaSemana !== 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!puedeModificar()) {
      setError('Solo puede modificar antes de la 1:00 PM');
      return;
    }

    if (tipoRegistro === 'permanente' && diasSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un día');
      return;
    }

    if (tipoRegistro === 'eventual' && fechasEventuales.length === 0) {
      setError('Debe seleccionar al menos una fecha');
      return;
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
      }
    } catch (err) {
      setError('Error al procesar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarDia = async (id: number, dia?: string) => {
    if (!puedeModificar()) {
      setError('Solo puede cancelar antes de la 1:00 PM');
      return;
    }

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

  const cambiarMes = (direccion: number) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + direccion, 1));
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
          <h3 className="text-xl font-bold mb-4">📅 Días Eventuales</h3>
          <div className="fechas-eventuales-grid">
            {registrosEventuales.map((registro) => (
              registro.fechas_especificas?.map((fecha: string) => (
                <div key={`${registro.id}-${fecha}`} className="fecha-eventual-item">
                  <span>{new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}</span>
                  <button
                    onClick={() => handleCancelarDia(registro.id)}
                    className="btn-cancelar-fecha"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              ))
            ))}
          </div>
        </div>
      )}

      {/* Botón Nuevo */}
      {!mostrarFormulario && (
        <div className="text-center">
          <button onClick={() => setMostrarFormulario(true)} className="btn-nuevo">
            ✨ Nuevo Registro
          </button>
        </div>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="formulario-card">
          <div className="tipo-selector-tabs">
            <button
              onClick={() => setTipoRegistro('permanente')}
              className={`tipo-tab ${tipoRegistro === 'permanente' ? 'active' : ''}`}
            >
              🔄 Permanente
            </button>
            <button
              onClick={() => setTipoRegistro('eventual')}
              className={`tipo-tab ${tipoRegistro === 'eventual' ? 'active' : ''}`}
            >
              📅 Eventual
            </button>
          </div>

          <form onSubmit={handleSubmit} className="form-content">
            {tipoRegistro === 'permanente' ? (
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
                    {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d) => (
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
    </div>
  );
}
