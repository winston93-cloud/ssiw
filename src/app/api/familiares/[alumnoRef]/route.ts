import { NextRequest, NextResponse } from 'next/server';
import { queryMySQL } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alumnoRef: string }> }
) {
  try {
    const { alumnoRef } = await params;

    // Primero obtener alumno_id desde alumno_ref
    const { data: alumnoData } = await queryMySQL(
      'SELECT alumno_id FROM alumno WHERE alumno_ref = ? LIMIT 1',
      [alumnoRef]
    );

    if (!alumnoData || (alumnoData as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    const alumno_id = (alumnoData as any[])[0].alumno_id;

    // Obtener familiares autorizados
    const { data: familiares } = await queryMySQL(
      `SELECT 
        familiar_id,
        alumno_id,
        tutor_id,
        familiar_nombre,
        familiar_app,
        familiar_apm,
        familiar_tel,
        familiar_cel,
        familiar_email
      FROM alumno_familiar 
      WHERE alumno_id = ?
      ORDER BY tutor_id ASC, familiar_app ASC`,
      [alumno_id]
    );

    return NextResponse.json({
      success: true,
      alumno_id,
      familiares: familiares || []
    });
  } catch (error: any) {
    console.error('Error al obtener familiares:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
