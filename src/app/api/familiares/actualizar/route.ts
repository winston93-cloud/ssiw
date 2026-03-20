import { NextRequest, NextResponse } from 'next/server';
import { queryMySQL } from '@/lib/mysql';

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

    if (!familiar_id || !familiar_nombre) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
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
