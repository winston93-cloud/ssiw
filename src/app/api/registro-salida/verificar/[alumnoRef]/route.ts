import { NextRequest, NextResponse } from 'next/server';
import { queryMySQL } from '@/lib/mysql';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alumnoRef: string }> }
) {
  try {
    const { alumnoRef } = await params;

    // Consultar alumno en MySQL
    const { data: alumnos, error } = await queryMySQL(
      'SELECT * FROM alumno WHERE alumno_ref = ? LIMIT 1',
      [alumnoRef]
    );

    if (error || !alumnos || (alumnos as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (alumnos as any[])[0],
    });
  } catch (error) {
    console.error('Error al verificar alumno:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar alumno' },
      { status: 500 }
    );
  }
}
