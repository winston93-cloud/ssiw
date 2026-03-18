'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alumno, getNivelEducativo } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const alumnoData = localStorage.getItem('alumno');
    if (!alumnoData) {
      router.push('/login');
    } else {
      setAlumno(JSON.parse(alumnoData));
    }
  }, [mounted, router]);

  const handleLogout = () => {
    localStorage.removeItem('alumno');
    router.push('/login');
  };

  if (!mounted || !alumno) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const nombreCompleto = alumno.alumno_nombre_completo || 
    `${alumno.alumno_nombre} ${alumno.alumno_app} ${alumno.alumno_apm}`;
  const nivel = getNivelEducativo(alumno.alumno_nivel);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white px-6 py-3 rounded-lg shadow-lg">
                <h1 className="text-xl font-bold">Instituto Winston Churchill</h1>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="flex items-start gap-6 flex-wrap">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {alumno.alumno_nombre?.[0] || 'A'}{alumno.alumno_app?.[0] || ''}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-[var(--primary)] mb-2">
                ¡Bienvenido/a!
              </h2>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-800">{nombreCompleto}</p>
                <p className="text-gray-600">
                  <span className="font-medium">No. Control:</span> {alumno.alumno_ref}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">{nivel}</span> - Grado {alumno.alumno_grado}° Grupo {alumno.alumno_grupo}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-600">Sistema de Salida Institucional</p>
          <p className="text-sm text-gray-500 mt-2">Funcionalidad de registro próximamente</p>
        </div>
      </div>
    </main>
  );
}
