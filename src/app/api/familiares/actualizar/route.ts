import { NextRequest, NextResponse } from 'next/server';
import { queryMySQL } from '@/lib/mysql';
import { isErrorResponse, requireAlumnoSession } from '@/lib/ssiwSession';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      familiar_id,
      tutor_id,
      familiar_nombre,
      familiar_app,
      familiar_apm,
      familiar_tel,
      familiar_cel,
      familiar_email
    } = body;

    const auth = requireAlumnoSession(request);
    if (isErrorResponse(auth)) return auth;

    if (!familiar_id || !familiar_nombre) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    const { data: rows } = await queryMySQL(
      'SELECT familiar_id, alumno_id FROM alumno_familiar WHERE familiar_id = ? LIMIT 1',
      [familiar_id]
    );
    const familiar = (rows as any[])?.[0];
    if (!familiar) {
      return NextResponse.json(
        { success: false, error: 'Familiar no encontrado' },
        { status: 404 }
      );
    }
    if (Number(familiar.alumno_id) !== Number(auth.alumno_id)) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { data } = await queryMySQL(
      `UPDATE alumno_familiar SET
        tutor_id = ?,
        familiar_nombre = ?,
        familiar_app = ?,
        familiar_apm = ?,
        familiar_tel = ?,
        familiar_cel = ?,
        familiar_email = ?
      WHERE familiar_id = ?`,
      [
        tutor_id || 0,
        familiar_nombre,
        familiar_app || '',
        familiar_apm || '',
        familiar_tel || '',
        familiar_cel || '',
        familiar_email || '',
        familiar_id
      ]
    );

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error al actualizar familiar:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
