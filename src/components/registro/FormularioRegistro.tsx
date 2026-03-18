'use client';

import React, { useState, useEffect } from 'react';
import { Alumno } from '@/types';

interface FormularioRegistroProps {
  alumno: Alumno;
}

type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes';

const DIAS_SEMANA: { value: DiaSemana; label: string; emoji: string }[] = [
  { value: 'lunes', label: 'Lunes', emoji: '🌙' },
  { value: 'martes', label: 'Martes', emoji: '🔥' },
  { value: 'miercoles', label: 'Miércoles', emoji: '⚡' },
  { value: 'jueves', label: 'Jueves', emoji: '⭐' },
  { value: 'viernes', label: 'Viernes', emoji: '🎉' },
];

export default function FormularioRegistro({ alumno }: FormularioRegistroProps) {
  const [tipoRegistro, setTipoRegistro] = useState<'permanente' | 'eventual'>('permanente');
  const [diasSeleccionados, setDiasSeleccionados] = useState<DiaSemana[]>([]);
  const [registrosExistentes, setRegistrosExistentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRegistros, setLoadingRegistros] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    nombre_tutor: '',
    email_tutor: '',
    telefono_tutor: '',
  });

  useEffect(() => {
    cargarRegistros();
  }, [alumno.alumno_ref]);

  const cargarRegistros = async () => {
    setLoadingRegistros(true);
    try {
      const response = await fetch(`/api/registro-salida/mis-registros/${alumno.alumno_ref}`);
      const data = await response.json();
      if (data.success) {
        setRegistrosExistentes(data.data || []);
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
        setError('Máximo 5 días por semana');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const puedeModificar = () => {
    const ahora = new Date();
    return ahora.getHours() < 13;
  };

  const getProximasSemanas = () => {
    const semanas = [];
    const hoy = new Date();
    
    for (let i = 0; i < 8; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + (i * 7));
      const inicioSemana = new Date(fecha);
      inicioSemana.setDate(fecha.getDate() - fecha.getDay() + 1);
      semanas.push(inicioSemana);
    }
    return semanas;
  };

  const formatearSemana = (fecha: Date) => {
    const inicio = new Date(fecha);
    const fin = new Date(fecha);
    fin.setDate(inicio.getDate() + 4);
    
    return `${inicio.getDate()}-${fin.getDate()} ${inicio.toLocaleDateString('es-MX', { month: 'short' })}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!puedeModificar()) {
      setError('Solo puede modificar antes de la 1:00 PM');
      return;
    }

    if (diasSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un día');
      return;
    }

    if (tipoRegistro === 'eventual' && !semanaSeleccionada) {
      setError('Debe seleccionar una semana');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = {
        alumno_ref: alumno.alumno_ref,
        tipo_registro: tipoRegistro,
        dias_semana: diasSeleccionados,
        fecha_inicio: tipoRegistro === 'eventual' ? semanaSeleccionada?.toISOString() : null,
        ...formData,
      };

      const response = await fetch('/api/registro-salida/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('✅ Registro guardado exitosamente');
        setDiasSeleccionados([]);
        setSemanaSeleccionada(null);
        setFormData({ nombre_tutor: '', email_tutor: '', telefono_tutor: '' });
        setMostrarFormulario(false);
        await cargarRegistros();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(result.error || 'Error al guardar');
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!puedeModificar()) {
      setError('Solo puede eliminar antes de la 1:00 PM');
      return;
    }

    if (!confirm('¿Eliminar este registro?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/registro-salida/eliminar/${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (result.success) {
        setSuccess('✅ Registro eliminado');
        await cargarRegistros();
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
        <p className="text-sm font-medium opacity-60">Cargando registros...</p>
      </div>
    );
  }

  return (
    <div className="registro-container">
      {/* Alertas */}
      {success && (
        <div className="alert-success">
          {success}
        </div>
      )}

      {error && (
        <div className="alert-error">
          ⚠️ {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {/* Registros Existentes */}
      {registrosExistentes.length > 0 && (
        <div className="registros-existentes">
          <h3 className="section-title">📋 Mis Registros Activos</h3>
          <div className="registros-grid">
            {registrosExistentes.map((registro) => (
              <div key={registro.id} className="registro-card">
                <div className="registro-badge">
                  {registro.tipo_registro === 'permanente' ? '🔄 Permanente' : '📅 Eventual'}
                </div>
                <div className="registro-dias">
                  {registro.dias_semana?.map((d: string) => (
                    <span key={d} className="dia-badge">
                      {d.substring(0, 3)}
                    </span>
                  ))}
                </div>
                <p className="registro-tutor">👤 {registro.nombre_tutor}</p>
                <button
                  onClick={() => handleEliminar(registro.id)}
                  disabled={!puedeModificar() || loading}
                  className="btn-eliminar"
                >
                  🗑️ Eliminar
                </button>
              </div>
            ))}
          </div>
          {!puedeModificar() && (
            <p className="warning-text">⏰ Solo puede modificar antes de la 1:00 PM</p>
          )}
        </div>
      )}

      {/* Botón Nuevo Registro */}
      {!mostrarFormulario && (
        <div className="text-center">
          <button
            onClick={() => setMostrarFormulario(true)}
            disabled={!puedeModificar()}
            className="btn-nuevo"
          >
            ✨ Nuevo Registro
          </button>
        </div>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="formulario-card">
          <h3 className="form-title">✨ Nuevo Registro de Salida</h3>
          
          <form onSubmit={handleSubmit} className="form-content">
            {/* Tipo de Registro */}
            <div className="tipo-selector">
              <button
                type="button"
                onClick={() => setTipoRegistro('permanente')}
                className={`tipo-btn ${tipoRegistro === 'permanente' ? 'active' : ''}`}
              >
                <span className="tipo-emoji">🔄</span>
                <span className="tipo-label">Permanente</span>
                <span className="tipo-desc">Cada semana</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoRegistro('eventual')}
                className={`tipo-btn ${tipoRegistro === 'eventual' ? 'active' : ''}`}
              >
                <span className="tipo-emoji">📅</span>
                <span className="tipo-label">Eventual</span>
                <span className="tipo-desc">Semanas específicas</span>
              </button>
            </div>

            {/* Selector de Días */}
            <div className="dias-section">
              <h4 className="dias-title">Días de la Semana <span className="dias-count">{diasSeleccionados.length}/5</span></h4>
              <div className="dias-grid">
                {DIAS_SEMANA.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDia(value)}
                    className={`dia-card ${diasSeleccionados.includes(value) ? 'selected' : ''}`}
                  >
                    <span className="dia-emoji">{emoji}</span>
                    <span className="dia-label">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendario para Eventual */}
            {tipoRegistro === 'eventual' && (
              <div className="semanas-section">
                <h4 className="dias-title">📆 Seleccionar Semana</h4>
                <div className="semanas-grid">
                  {getProximasSemanas().map((semana, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSemanaSeleccionada(semana)}
                      className={`semana-card ${
                        semanaSeleccionada?.getTime() === semana.getTime() ? 'selected' : ''
                      }`}
                    >
                      <span className="semana-numero">Semana {index + 1}</span>
                      <span className="semana-fecha">{formatearSemana(semana)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Datos del Tutor */}
            <div className="tutor-section">
              <h4 className="dias-title">👤 Datos del Tutor</h4>
              
              <div className="input-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Juan Pérez López"
                  value={formData.nombre_tutor}
                  onChange={(e) => setFormData({ ...formData, nombre_tutor: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email_tutor}
                  onChange={(e) => setFormData({ ...formData, email_tutor: e.target.value })}
                  required
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label>Teléfono (10 dígitos)</label>
                <input
                  type="tel"
                  placeholder="5551234567"
                  value={formData.telefono_tutor}
                  onChange={(e) => setFormData({ ...formData, telefono_tutor: e.target.value })}
                  required
                  maxLength={10}
                  className="form-input"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setDiasSeleccionados([]);
                  setSemanaSeleccionada(null);
                  setError('');
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || diasSeleccionados.length === 0}
                className="btn-guardar"
              >
                {loading ? '⏳ Guardando...' : '💾 Guardar Registro'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
