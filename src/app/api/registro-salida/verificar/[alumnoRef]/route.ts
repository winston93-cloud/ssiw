import { NextRequest, NextResponse } from 'next/server';
import { queryMySQL } from '@/lib/mysql';
import { verificarPIN } from '@/lib/auth-maestras';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alumnoRef: string }> }
) {
  try {
    const { alumnoRef } = await params;

    // Primero verificar si es un PIN de maestra
    const resultadoMaestra = verificarPIN(alumnoRef);
    if (resultadoMaestra.valido) {
      return NextResponse.json({
        success: true,
        tipo: 'maestra',
        data: resultadoMaestra.maestra,
      });
    }

    // Si no es maestra, consultar alumno en MySQL
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

    return NextResponse.json({
      success: true,
      tipo: 'alumno',
      data: (alumnos as any[])[0],
    });
  } catch (error) {
    console.error('Error al verificar:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar' },
      { status: 500 }
    );
  }
}
