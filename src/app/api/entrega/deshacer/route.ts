import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function POST(request: NextRequest) {
  try {
    const { alumno_ref } = await request.json();

    if (!alumno_ref) {
      return NextResponse.json(
        { success: false, error: 'Falta alumno_ref' },
        { status: 400 }
      );
    }

    const hoy = new Date().toISOString().split('T')[0];

    // Eliminar el registro de entrega del día de hoy
    const { error } = await insforge.database
      .from('entregas_alumnos')
      .delete()
      .eq('alumno_ref', alumno_ref)
      .eq('fecha', hoy);

    if (error) {
      console.error('Error al deshacer entrega:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al procesar deshacer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
