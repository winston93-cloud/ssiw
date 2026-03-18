'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alumno, getNivelEducativo } from '@/types';
import FormularioRegistro from '@/components/registro/FormularioRegistro';

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
              <div className="hidden md:block">
                <p className="text-sm text-gray-600">Sistema de Salida Institucional</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
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
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-800 truncate">{nombreCompleto}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="text-gray-600">
                      <span className="font-medium">No. Control:</span> {alumno.alumno_ref}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-600">
                      <span className="font-medium">{nivel}</span> - Grado {alumno.alumno_grado}° Grupo {alumno.alumno_grupo}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Registrar Salida a Pie</h3>
          <p className="text-gray-600">
            Seleccione una fecha y complete los datos del tutor que recogerá al alumno
          </p>
        </div>

        <FormularioRegistro alumno={alumno} />
      </div>
    </main>
  );
}
