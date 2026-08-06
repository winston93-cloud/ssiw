import { NextRequest, NextResponse } from 'next/server'
import { queryMySQL } from '@/lib/mysql'
import {
  applySessionCookie,
  signSession,
  verifyHandoffToken,
} from '@/lib/ssiwSession'

export const runtime = 'nodejs'

/**
 * Consume token SSO de servicios_admin y crea cookie httpOnly de sesión SSIW.
 * Body: { token: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { token?: string } | null
    const token = String(body?.token ?? '').trim()
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 400 })
    }

    const handoff = verifyHandoffToken(token)
    if (!handoff) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 401 }
      )
    }

    if (handoff.role === 'alumno') {
      const { data: alumnos, error } = await queryMySQL(
        'SELECT * FROM alumno WHERE alumno_ref = ? AND alumno_id = ? LIMIT 1',
        [handoff.alumno_ref, handoff.alumno_id]
      )
      if (error || !alumnos || (alumnos as unknown[]).length === 0) {
        return NextResponse.json(
          { success: false, error: 'Alumno no encontrado' },
          { status: 404 }
        )
      }
      const alumno = (alumnos as Record<string, unknown>[])[0]
      const sessionToken = signSession({
        role: 'alumno',
        displayName: handoff.displayName,
        alumno_ref: String(handoff.alumno_ref),
        alumno_id: handoff.alumno_id,
      })
      const res = NextResponse.json({
        success: true,
        role: 'alumno',
        redirect: '/dashboard',
        data: alumno,
      })
      applySessionCookie(res, sessionToken)
      return res
    }

    const maestra = {
      id: String(handoff.usuario_username || handoff.usuario_id),
      nombre: handoff.displayName,
      usuario_id: handoff.usuario_id,
      usuario_username: handoff.usuario_username,
    }
    const sessionToken = signSession({
      role: 'maestra',
      displayName: handoff.displayName,
      usuario_id: handoff.usuario_id,
      usuario_username: handoff.usuario_username,
    })
    const res = NextResponse.json({
      success: true,
      role: 'maestra',
      redirect: '/entrega/dashboard',
      data: maestra,
    })
    applySessionCookie(res, sessionToken)
    return res
  } catch (e) {
    console.error('POST /api/auth/handoff:', e)
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Error en handoff' },
      { status: 500 }
    )
  }
}
