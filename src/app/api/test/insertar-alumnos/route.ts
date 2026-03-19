import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET() {
  try {
    // Primero verificar la estructura de la tabla
    const { data: existing, error: selectError } = await insforge.database
      .from('alumno')
      .select('*')
      .limit(1);

    console.log('Estructura actual de alumno:', existing);

    // Insertar solo con alumno_ref
    const alumnos = [
      { alumno_ref: '10001' },
      { alumno_ref: '10002' },
      { alumno_ref: '10003' },
      { alumno_ref: '10004' },
      { alumno_ref: '10005' }
    ];

    const { data, error } = await insforge.database
      .from('alumno')
      .insert(alumnos)
      .select();

    if (error) {
      console.error('Error al insertar alumnos:', error);
      return NextResponse.json(
        { success: false, error: error.message, existing },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Alumnos insertados exitosamente',
      data
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
