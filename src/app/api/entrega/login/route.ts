import { NextRequest, NextResponse } from 'next/server'
import { verificarPIN } from '@/lib/auth-maestras'
import { applySessionCookie, signSession } from '@/lib/ssiwSession'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as { clave?: string } | null
    const clave = String(body?.clave ?? '').trim()
    if (!clave) {
      return NextResponse.json({ success: false, error: 'Ingresa la contraseña' }, { status: 400 })
    }

    const resultado = verificarPIN(clave)
    if (!resultado.valido || !resultado.maestra) {
      return NextResponse.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 })
    }

    const sessionToken = signSession({
      role: 'maestra',
      displayName: resultado.maestra.nombre,
      usuario_username: resultado.maestra.id,
    })

    const res = NextResponse.json({
      success: true,
      data: resultado.maestra,
    })
    applySessionCookie(res, sessionToken)
    return res
  } catch (error) {
    console.error('POST /api/entrega/login:', error)
    return NextResponse.json({ success: false, error: 'Error al iniciar sesión' }, { status: 500 })
  }
}
