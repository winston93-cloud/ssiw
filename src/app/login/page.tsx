'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { verificarAlumno } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [alumnoRef, setAlumnoRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verificarAlumno(alumnoRef);
      
      if (response.success) {
        localStorage.setItem('alumno', JSON.stringify(response.data));
        router.push('/dashboard');
      } else {
        setError(response.error || 'Número de control no encontrado');
      }
    } catch (err) {
      setError('Error al verificar el número de control');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white px-8 py-4 rounded-2xl shadow-lg mb-6">
            <h1 className="text-3xl font-bold">Instituto Winston Churchill</h1>
            <p className="text-blue-100 mt-2">Sistema de Salida Institucional</p>
          </div>
          <p className="text-gray-600">
            Ingrese el número de control del alumno para continuar
          </p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[var(--primary)]">Acceso al Sistema</h2>
              <p className="text-sm text-gray-600 mt-2">
                Padres y tutores
              </p>
            </div>

            <Input
              label="Número de Control del Alumno"
              type="text"
              placeholder="Ingrese el número de control"
              value={alumnoRef}
              onChange={(e) => setAlumnoRef(e.target.value.toUpperCase())}
              required
              helperText="Ejemplo: 2024001, A1234, etc."
            />

            <Button type="submit" isLoading={loading} className="w-full" size="lg">
              Ingresar
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>¿No conoce el número de control?</p>
              <p className="mt-1">Consulte con la administración del instituto</p>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Instituto Winston Churchill</p>
          <p className="mt-1">Sistema de Salida Institucional v1.0</p>
        </div>
      </div>
    </main>
  );
}
