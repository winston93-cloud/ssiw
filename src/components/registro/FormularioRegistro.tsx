'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { crearRegistro } from '@/services/api';
import { Alumno } from '@/types';
import CalendarioSelector from './CalendarioSelector';

interface FormularioRegistroProps {
  alumno: Alumno;
}

export default function FormularioRegistro({ alumno }: FormularioRegistroProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nombre_tutor: '',
    email_tutor: '',
    telefono_tutor: '',
  });

  const handleSeleccionarFecha = (fecha: Date) => {
    setFechaSeleccionada(fecha);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        alumno_ref: alumno.alumno_ref,
        fecha: fechaSeleccionada!.toISOString().split('T')[0],
        ...formData,
      };

      const response = await crearRegistro(data);

      if (response.success) {
        setSuccess(response.message || 'Registro creado exitosamente. Revise su correo para confirmar.');
        setFormData({ nombre_tutor: '', email_tutor: '', telefono_tutor: '' });
        setFechaSeleccionada(null);
        setStep(1);
      } else {
        setError(response.error || 'Error al crear el registro');
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFechaSeleccionada(null);
    setFormData({ nombre_tutor: '', email_tutor: '', telefono_tutor: '' });
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {success && (
        <div className="mb-6">
          <Alert
            type="success"
            title="¡Éxito!"
            message={success}
            onClose={() => setSuccess('')}
          />
        </div>
      )}

      {step === 1 && (
        <Card title="Seleccionar Fecha" subtitle="Escoja la fecha para la salida a pie">
          <div className="space-y-6">
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <CalendarioSelector
              alumnoRef={alumno.alumno_ref}
              onSeleccionarFecha={handleSeleccionarFecha}
            />
          </div>
        </Card>
      )}

      {step === 2 && fechaSeleccionada && (
        <Card title="Datos del Tutor" subtitle="Complete la información del padre/tutor que recogerá al alumno">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Fecha Seleccionada</h4>
              <p className="text-sm">
                {fechaSeleccionada.toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <Input
              label="Nombre Completo del Tutor"
              type="text"
              placeholder="Ej: Juan Pérez López"
              value={formData.nombre_tutor}
              onChange={(e) => setFormData({ ...formData, nombre_tutor: e.target.value })}
              required
              helperText="Nombre del padre/madre/tutor que recogerá al alumno"
            />

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.email_tutor}
              onChange={(e) => setFormData({ ...formData, email_tutor: e.target.value })}
              required
              helperText="Se enviará un correo de confirmación a esta dirección"
            />

            <Input
              label="Teléfono"
              type="tel"
              placeholder="5551234567"
              value={formData.telefono_tutor}
              onChange={(e) => setFormData({ ...formData, telefono_tutor: e.target.value })}
              required
              helperText="10 dígitos sin espacios ni guiones"
              maxLength={10}
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Recibirá un correo electrónico de confirmación. 
                Debe hacer clic en el enlace para completar el registro.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Volver
              </Button>
              <Button type="submit" isLoading={loading} className="flex-1">
                Registrar Salida
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
