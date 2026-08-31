'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { urlServiciosAdminDashboard } from '@/lib/serviciosAdminUrl'
import { fetchSsiwSession, ssiwFetch, clearMaestraLocal } from '@/lib/entregaAuth'

export default function EntregaLoginPage() {
  const router = useRouter()
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    ;(async () => {
      const session = await fetchSsiwSession()
      if (session?.role === 'maestra') {
        localStorage.setItem('maestra', JSON.stringify(session.data))
        router.replace('/entrega/dashboard')
        return
      }
      // localStorage obsoleto sin cookie válida
      clearMaestraLocal()
    })()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await ssiwFetch('/api/entrega/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: clave.trim() }),
      })
      const data = await response.json()

      if (response.ok && data.success && data.data) {
        localStorage.removeItem('alumno')
        localStorage.setItem('maestra', JSON.stringify(data.data))
        router.push('/entrega/dashboard')
      } else {
        setError(data.error || 'Contraseña incorrecta')
      }
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

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
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="institute-name">Entrega a Pie</h1>
            <p className="institute-subtitle">Acceso para personal de entregas</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className={`input-wrapper ${focused || clave ? 'active' : ''} ${error ? 'error' : ''}`}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="password"
                  id="claveEntrega"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  required
                  className="floating-input"
                  placeholder=" "
                  disabled={loading}
                  autoComplete="current-password"
                />
                <label htmlFor="claveEntrega" className="floating-label">
                  Contraseña
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
                  <span>Entrar</span>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="login-footer" style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="btn-volver-dashboard"
              onClick={() => { window.location.href = urlServiciosAdminDashboard() }}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Volver al dashboard principal
            </button>
          </div>
        </div>

        <footer className="page-footer">
          <p>&copy; {new Date().getFullYear()} Instituto Winston Churchill</p>
        </footer>
      </div>
    </main>
  )
}
