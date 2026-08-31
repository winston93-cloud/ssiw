'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthHandoffInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')?.trim()
    if (!token) {
      setError('Falta el token de acceso')
      return
    }

    let cancelado = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/handoff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token }),
        })
        const data = (await res.json().catch(() => ({}))) as {
          success?: boolean
          role?: string
          redirect?: string
          data?: unknown
          error?: string
        }
        if (!res.ok || !data.success || !data.data) {
          throw new Error(data.error || 'No se pudo iniciar sesión en SSIW')
        }

        localStorage.removeItem('alumno')
        localStorage.removeItem('maestra')
        if (data.role === 'maestra') {
          localStorage.setItem('maestra', JSON.stringify(data.data))
        } else {
          localStorage.setItem('alumno', JSON.stringify(data.data))
        }

        if (!cancelado) {
          router.replace(data.redirect || (data.role === 'maestra' ? '/entrega/dashboard' : '/dashboard'))
        }
      } catch (e) {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : 'Error al abrir SSIW')
        }
      }
    })()

    return () => {
      cancelado = true
    }
  }, [router, searchParams])

  if (error) {
    return (
      <main className="login-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</p>
        <a href="/login">Ir al login</a>
      </main>
    )
  }

  return (
    <main className="login-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Validando acceso SSIW…</p>
    </main>
  )
}

export default function AuthHandoffPage() {
  return (
    <Suspense
      fallback={
        <main className="login-container" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Validando acceso SSIW…</p>
        </main>
      }
    >
      <AuthHandoffInner />
    </Suspense>
  )
}
