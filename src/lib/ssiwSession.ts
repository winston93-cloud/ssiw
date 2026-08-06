import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export const SSIW_SESSION_COOKIE = 'ssiw_session'
const SESSION_TTL_SEC = 60 * 60 * 8 // 8 h

export type SsiwHandoffRole = 'alumno' | 'maestra'

export type SsiwHandoffPayload = {
  role: SsiwHandoffRole
  displayName: string
  alumno_ref?: number
  alumno_id?: number
  usuario_id?: number
  usuario_username?: string
  exp: number
}

export type SsiwSession = {
  role: SsiwHandoffRole
  displayName: string
  alumno_ref?: string
  alumno_id?: number
  usuario_id?: number
  usuario_username?: string
  exp: number
}

function getSecret(): string {
  const secret = process.env.SSIW_HANDOFF_SECRET?.trim()
  if (!secret) {
    throw new Error('SSIW_HANDOFF_SECRET no configurado')
  }
  return secret
}

function signBody(body: string): string {
  return createHmac('sha256', getSecret()).update(body).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

export function verifyHandoffToken(token: string): SsiwHandoffPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  if (!body || !sig) return null

  try {
    if (!safeEqual(sig, signBody(body))) return null
  } catch {
    return null
  }

  try {
    const raw = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SsiwHandoffPayload
    if (!raw || (raw.role !== 'alumno' && raw.role !== 'maestra')) return null
    if (!raw.displayName || typeof raw.exp !== 'number') return null
    if (raw.exp < Math.floor(Date.now() / 1000)) return null
    if (raw.role === 'alumno') {
      const ref = Number(raw.alumno_ref)
      const id = Number(raw.alumno_id)
      if (!Number.isFinite(ref) || ref <= 0 || !Number.isFinite(id) || id <= 0) return null
    }
    if (raw.role === 'maestra') {
      const uid = Number(raw.usuario_id)
      if (!Number.isFinite(uid) || uid <= 0) return null
    }
    return raw
  } catch {
    return null
  }
}

export function signSession(payload: Omit<SsiwSession, 'exp'>, ttlSec = SESSION_TTL_SEC): string {
  const full: SsiwSession = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSec,
  }
  const body = Buffer.from(JSON.stringify(full), 'utf8').toString('base64url')
  return `${body}.${signBody(body)}`
}

export function verifySessionToken(token: string): SsiwSession | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  if (!body || !sig) return null
  try {
    if (!safeEqual(sig, signBody(body))) return null
  } catch {
    return null
  }
  try {
    const raw = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SsiwSession
    if (!raw || (raw.role !== 'alumno' && raw.role !== 'maestra')) return null
    if (!raw.displayName || typeof raw.exp !== 'number') return null
    if (raw.exp < Math.floor(Date.now() / 1000)) return null
    return raw
  } catch {
    return null
  }
}

export function readSessionFromRequest(request: NextRequest): SsiwSession | null {
  const token = request.cookies.get(SSIW_SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export function applySessionCookie(res: NextResponse, sessionToken: string): void {
  res.cookies.set(SSIW_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SEC,
  })
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(SSIW_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export function allowLegacyLogin(): boolean {
  if (process.env.SSIW_ALLOW_LEGACY_LOGIN === '1') return true
  return process.env.NODE_ENV !== 'production'
}

export function unauthorized(message = 'No autenticado'): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 401 })
}

/** Sesión de alumno; si se pasa alumnoRef, debe coincidir. */
export function requireAlumnoSession(
  request: NextRequest,
  alumnoRef?: string | number | null
): SsiwSession | NextResponse {
  const session = readSessionFromRequest(request)
  if (!session || session.role !== 'alumno') {
    return unauthorized('Sesión de alumno requerida')
  }
  if (alumnoRef != null && String(alumnoRef).trim() !== '') {
    if (String(session.alumno_ref) !== String(alumnoRef).trim()) {
      return unauthorized('No puedes operar sobre otro alumno')
    }
  }
  return session
}

export function requireMaestraSession(request: NextRequest): SsiwSession | NextResponse {
  const session = readSessionFromRequest(request)
  if (!session || session.role !== 'maestra') {
    return unauthorized('Sesión de entregas requerida')
  }
  return session
}

/** Alumno dueño del ref, o maestra (consulta cruzada en entregas). */
export function requireAlumnoOrMaestra(
  request: NextRequest,
  alumnoRef?: string | number | null
): SsiwSession | NextResponse {
  const session = readSessionFromRequest(request)
  if (!session) return unauthorized()
  if (session.role === 'maestra') return session
  if (session.role === 'alumno') {
    if (alumnoRef != null && String(alumnoRef).trim() !== '') {
      if (String(session.alumno_ref) !== String(alumnoRef).trim()) {
        return unauthorized('No puedes operar sobre otro alumno')
      }
    }
    return session
  }
  return unauthorized()
}

export function isErrorResponse(v: SsiwSession | NextResponse): v is NextResponse {
  return v instanceof NextResponse
}
