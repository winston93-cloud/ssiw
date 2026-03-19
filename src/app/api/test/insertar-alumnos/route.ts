import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET() {
  try {
    const alumnos = [
      {
        alumno_ref: '10001',
        alumno_app: 'García',
        alumno_apm: 'López',
        alumno_nombre: 'Juan',
        alumno_nivel: 3,
        alumno_grado: 1,
        alumno_grupo: 1,
        alumno_nombre_completo: 'Juan García López'
      },
      {
        alumno_ref: '10002',
        alumno_app: 'Martínez',
        alumno_apm: 'Rodríguez',
        alumno_nombre: 'María',
        alumno_nivel: 3,
        alumno_grado: 2,
        alumno_grupo: 1,
        alumno_nombre_completo: 'María Martínez Rodríguez'
      },
      {
        alumno_ref: '10003',
        alumno_app: 'Hernández',
        alumno_apm: 'Sánchez',
        alumno_nombre: 'Pedro',
        alumno_nivel: 2,
        alumno_grado: 2,
        alumno_grupo: 1,
        alumno_nombre_completo: 'Pedro Hernández Sánchez'
      },
      {
        alumno_ref: '10004',
        alumno_app: 'González',
        alumno_apm: 'Ramírez',
        alumno_nombre: 'Ana',
        alumno_nivel: 3,
        alumno_grado: 3,
        alumno_grupo: 2,
        alumno_nombre_completo: 'Ana González Ramírez'
      },
      {
        alumno_ref: '10005',
        alumno_app: 'Pérez',
        alumno_apm: 'Torres',
        alumno_nombre: 'Luis',
        alumno_nivel: 4,
        alumno_grado: 1,
        alumno_grupo: 1,
        alumno_nombre_completo: 'Luis Pérez Torres'
      }
    ];

    const { data, error } = await insforge.database
      .from('alumno')
      .insert(alumnos)
      .select();

    if (error) {
      console.error('Error al insertar alumnos:', error);
      return NextResponse.json(
        { success: false, error: error.message },
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
