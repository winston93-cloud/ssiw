'use client';

import React, { useState, useEffect } from 'react';
import { obtenerFechasDisponibles } from '@/services/api';
import { Button } from '../ui/Button';

interface CalendarioSelectorProps {
  alumnoRef: string;
  onSeleccionarFecha: (fecha: Date) => void;
}

export default function CalendarioSelector({
  alumnoRef,
  onSeleccionarFecha,
}: CalendarioSelectorProps) {
  const [mesActual, setMesActual] = useState(new Date());
  const [fechasRegistradas, setFechasRegistradas] = useState<string[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarFechasRegistradas();
  }, [mesActual, alumnoRef]);

  const cargarFechasRegistradas = async () => {
    setLoading(true);
    try {
      const mes = mesActual.getMonth() + 1;
      const anio = mesActual.getFullYear();
      const response = await obtenerFechasDisponibles(alumnoRef, mes, anio);
      
      if (response.success) {
        setFechasRegistradas(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar fechas:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerDiasDelMes = () => {
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

  const esFechaDisponible = (fecha: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fecha < hoy) return false;
    
    const diaSemana = fecha.getDay();
    if (diaSemana === 0 || diaSemana === 6) return false;
    
    const fechaStr = fecha.toISOString().split('T')[0];
    return !fechasRegistradas.includes(fechaStr);
  };

  const cambiarMes = (incremento: number) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + incremento, 1));
  };

  const handleSeleccionarDia = (fecha: Date) => {
    if (esFechaDisponible(fecha)) {
      setFechaSeleccionada(fecha);
    }
  };

  const handleConfirmar = () => {
    if (fechaSeleccionada) {
      onSeleccionarFecha(fechaSeleccionada);
    }
  };

  const dias = obtenerDiasDelMes();
  const nombreMes = mesActual.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cambiarMes(-1)}
        >
          ← Anterior
        </Button>
        <h3 className="text-lg font-semibold capitalize">{nombreMes}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cambiarMes(1)}
        >
          Siguiente →
        </Button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
          <div key={dia} className="text-center font-semibold text-sm py-2 text-gray-600">
            {dia}
          </div>
        ))}

        {dias.map((fecha, index) => {
          if (!fecha) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const disponible = esFechaDisponible(fecha);
          const seleccionada = fechaSeleccionada?.toDateString() === fecha.toDateString();

          return (
            <button
              key={fecha.toISOString()}
              type="button"
              onClick={() => handleSeleccionarDia(fecha)}
              disabled={!disponible}
              className={`
                aspect-square rounded-lg font-medium text-sm transition-all duration-200
                ${disponible 
                  ? 'hover:bg-blue-100 cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
                ${seleccionada 
                  ? 'bg-[var(--primary)] text-white ring-2 ring-[var(--primary)] ring-offset-2' 
                  : 'bg-white border border-gray-200'
                }
              `}
            >
              {fecha.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex items-start gap-4 text-xs text-gray-600 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--primary)] rounded"></div>
          <span>Seleccionada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>No disponible</span>
        </div>
      </div>

      {fechaSeleccionada && (
        <Button type="button" onClick={handleConfirmar} className="w-full">
          Continuar con esta fecha
        </Button>
      )}
    </div>
  );
}
