import { NextRequest, NextResponse } from 'next/server';
import { queryMySQL } from '@/lib/mysql';
import { verificarPIN } from '@/lib/auth-maestras';
import {
  allowLegacyLogin,
  applySessionCookie,
  signSession,
} from '@/lib/ssiwSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alumnoRef: string }> }
) {
  try {
    const { alumnoRef } = await params;

    // PIN de maestra: solo en local/dev o con SSIW_ALLOW_LEGACY_LOGIN=1
    if (allowLegacyLogin()) {
      const resultadoMaestra = verificarPIN(alumnoRef);
      if (resultadoMaestra.valido && resultadoMaestra.maestra) {
        const sessionToken = signSession({
          role: 'maestra',
          displayName: resultadoMaestra.maestra.nombre,
          usuario_username: resultadoMaestra.maestra.id,
        });
        const res = NextResponse.json({
          success: true,
          tipo: 'maestra',
          data: resultadoMaestra.maestra,
        });
        applySessionCookie(res, sessionToken);
        return res;
      }
    }

    const { data: alumnos, error } = await queryMySQL(
      'SELECT * FROM alumno WHERE alumno_ref = ? LIMIT 1',
      [alumnoRef]
    );

    if (error || !alumnos || (alumnos as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Número de control no encontrado' },
        { status: 404 }
      );
    }

    const alumno = (alumnos as any[])[0];
    const displayName =
      alumno.alumno_nombre_completo ||
      [alumno.alumno_nombre, alumno.alumno_app, alumno.alumno_apm].filter(Boolean).join(' ') ||
      String(alumno.alumno_ref);

    const sessionToken = signSession({
      role: 'alumno',
      displayName,
      alumno_ref: String(alumno.alumno_ref),
      alumno_id: Number(alumno.alumno_id),
    });

    const res = NextResponse.json({
      success: true,
      tipo: 'alumno',
      data: alumno,
    });
    applySessionCookie(res, sessionToken);
    return res;
  } catch (error) {
    console.error('Error al verificar:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar' },
      { status: 500 }
    );
  }
}
