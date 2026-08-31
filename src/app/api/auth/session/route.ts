import { NextRequest, NextResponse } from 'next/server';
import { readSessionFromRequest, unauthorized } from '@/lib/ssiwSession';

/** Devuelve la sesión activa (cookie) o 401. */
export async function GET(request: NextRequest) {
  const session = readSessionFromRequest(request);
  if (!session) {
    return unauthorized('Sesión no válida o expirada');
  }

  if (session.role === 'maestra') {
    return NextResponse.json({
      success: true,
      role: 'maestra',
      data: {
        id: session.usuario_username || 'maestra',
        nombre: session.displayName,
      },
    });
  }

  return NextResponse.json({
    success: true,
    role: 'alumno',
    data: {
      alumno_ref: session.alumno_ref,
      alumno_id: session.alumno_id,
      displayName: session.displayName,
    },
  });
}
