import { NextRequest, NextResponse } from 'next/server';
import { queryMySQL } from '@/lib/mysql';
import { isErrorResponse, requireAlumnoSession } from '@/lib/ssiwSession';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familiar_id = searchParams.get('familiar_id');

    const auth = requireAlumnoSession(request);
    if (isErrorResponse(auth)) return auth;

    if (!familiar_id) {
      return NextResponse.json(
        { success: false, error: 'Falta familiar_id' },
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
      'DELETE FROM alumno_familiar WHERE familiar_id = ?',
      [familiar_id]
    );

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error al eliminar familiar:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

