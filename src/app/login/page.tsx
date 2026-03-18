'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verificarAlumno } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [alumnoRef, setAlumnoRef] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const alumnoData = localStorage.getItem('alumno');
    if (alumnoData) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verificarAlumno(alumnoRef.trim());

      if (response.success && response.data) {
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

  if (!mounted) return null;

  return (
    <main className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="institute-logo">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4L6 14V22C6 32 12 40.5 24 44C36 40.5 42 32 42 22V14L24 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M24 16V28M18 22H30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="institute-name">Instituto Winston Churchill</h1>
            <p className="institute-subtitle">Sistema de Salida Institucional</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className={`input-wrapper ${focused || alumnoRef ? 'active' : ''} ${error ? 'error' : ''}`}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  id="alumnoRef"
                  value={alumnoRef}
                  onChange={(e) => setAlumnoRef(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  required
                  className="floating-input"
                  placeholder=" "
                  disabled={loading}
                />
                <label htmlFor="alumnoRef" className="floating-label">
                  Número de Control del Alumno
                </label>
              </div>
              {error && (
                <div className="error-message">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
                  </svg>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <a href="#" className="help-link">
              ¿No conoce el número de control?
            </a>
          </div>
        </div>

        <footer className="page-footer">
          <p>&copy; {new Date().getFullYear()} Instituto Winston Churchill</p>
        </footer>
      </div>
    </main>
  );
}
