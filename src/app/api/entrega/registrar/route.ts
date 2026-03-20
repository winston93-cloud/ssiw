import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function POST(request: NextRequest) {
  try {
    const { alumno_ref, maestra_id, maestra_nombre } = await request.json();

    if (!alumno_ref || !maestra_id || !maestra_nombre) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const hoy = new Date().toISOString().split('T')[0];

    // Verificar si ya fue entregado hoy
    const { data: existente } = await insforge.database
      .from('entregas_alumnos')
      .select('*')
      .eq('alumno_ref', alumno_ref)
      .eq('fecha', hoy)
      .single();

    if (existente) {
      return NextResponse.json(
        { success: false, error: 'Alumno ya fue entregado hoy' },
        { status: 400 }
      );
    }

    // Registrar entrega
    const { data, error } = await insforge.database
      .from('entregas_alumnos')
      .insert({
        alumno_ref,
        maestra_id,
        maestra_nombre
      })
      .select()
      .single();

    if (error) {
      console.error('Error al registrar entrega:', error);
      return NextResponse.json(
        { success: false, error: 'Error al registrar entrega' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
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
