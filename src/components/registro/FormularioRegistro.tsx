'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { Alumno } from '@/types';

interface FormularioRegistroProps {
  alumno: Alumno;
}

type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes';

const DIAS_SEMANA: { value: DiaSemana; label: string }[] = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
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
      console.error('Error al cargar registros:', error);
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
    const hora = ahora.getHours();
    return hora < 13; // Antes de 1pm
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

    setError('');
    setLoading(true);

    try {
      const data = {
        alumno_ref: alumno.alumno_ref,
        tipo_registro: tipoRegistro,
        dias_semana: diasSeleccionados,
        ...formData,
      };

      const response = await fetch('/api/registro-salida/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Registro guardado exitosamente');
        setDiasSeleccionados([]);
        setFormData({ nombre_tutor: '', email_tutor: '', telefono_tutor: '' });
        setMostrarFormulario(false);
        await cargarRegistros();
      } else {
        setError(result.error || 'Error al guardar el registro');
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

    if (!confirm('¿Está seguro de eliminar este registro?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/registro-salida/eliminar/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Registro eliminado exitosamente');
        await cargarRegistros();
      } else {
        setError(result.error || 'Error al eliminar');
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRegistros) {
    return (
      <div className="text-center py-8">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-sm opacity-60">Cargando registros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert
          type="success"
          title="¡Éxito!"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Registros Existentes */}
      {registrosExistentes.length > 0 && (
        <Card title="Mis Registros de Salida" subtitle="Configuración actual">
          <div className="space-y-4">
            {registrosExistentes.map((registro) => (
              <div
                key={registro.id}
                className="flex items-start justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      registro.tipo_registro === 'permanente'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400'
                    }`}>
                      {registro.tipo_registro === 'permanente' ? 'Permanente' : 'Eventual'}
                    </span>
                  </div>
                  <p className="font-semibold mb-1">
                    Días: {registro.dias_semana?.map((d: string) => 
                      d.charAt(0).toUpperCase() + d.slice(1)
                    ).join(', ')}
                  </p>
                  <p className="text-sm opacity-75">Tutor: {registro.nombre_tutor}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEliminar(registro.id)}
                  disabled={!puedeModificar() || loading}
                  className="ml-4"
                >
                  Eliminar
                </Button>
              </div>
            ))}
            {!puedeModificar() && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Solo puede modificar antes de la 1:00 PM
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Botón para mostrar formulario */}
      {!mostrarFormulario && (
        <div className="text-center">
          <Button
            onClick={() => setMostrarFormulario(true)}
            disabled={!puedeModificar()}
          >
            + Nuevo Registro
          </Button>
        </div>
      )}

      {/* Formulario Nuevo Registro */}
      {mostrarFormulario && (
        <Card title="Nuevo Registro" subtitle="Configure los días de salida a pie">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Registro */}
            <div>
              <label className="block text-sm font-semibold mb-3">Tipo de Registro</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoRegistro('permanente')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tipoRegistro === 'permanente'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-semibold mb-1">Permanente</div>
                  <div className="text-xs opacity-75">Se repite cada semana</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoRegistro('eventual')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tipoRegistro === 'eventual'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="font-semibold mb-1">Eventual</div>
                  <div className="text-xs opacity-75">Semanas específicas</div>
                </button>
              </div>
            </div>

            {/* Selector de Días */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Días de la Semana (máximo 5)
              </label>
              <div className="grid grid-cols-5 gap-2">
                {DIAS_SEMANA.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDia(value)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      diasSeleccionados.includes(value)
                        ? 'bg-blue-600 text-white shadow-md scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {label.substring(0, 3)}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2 opacity-60">
                {diasSeleccionados.length}/5 días seleccionados
              </p>
            </div>

            {/* Datos del Tutor */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Input
                label="Nombre Completo del Tutor"
                type="text"
                placeholder="Ej: Juan Pérez López"
                value={formData.nombre_tutor}
                onChange={(e) => setFormData({ ...formData, nombre_tutor: e.target.value })}
                required
              />

              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="ejemplo@correo.com"
                value={formData.email_tutor}
                onChange={(e) => setFormData({ ...formData, email_tutor: e.target.value })}
                required
              />

              <Input
                label="Teléfono"
                type="tel"
                placeholder="5551234567"
                value={formData.telefono_tutor}
                onChange={(e) => setFormData({ ...formData, telefono_tutor: e.target.value })}
                required
                maxLength={10}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMostrarFormulario(false);
                  setDiasSeleccionados([]);
                  setError('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                isLoading={loading} 
                className="flex-1"
                disabled={diasSeleccionados.length === 0}
              >
                Guardar Registro
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
