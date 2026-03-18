import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alumnoRef: string }> }
) {
  try {
    const { alumnoRef } = await params;

    const { data: alumno, error } = await supabase
      .from('alumno')
      .select('*')
      .eq('alumno_ref', alumnoRef)
      .single();

    if (error || !alumno) {
      return NextResponse.json(
        { success: false, error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: alumno,
    });
  } catch (error) {
    console.error('Error al verificar alumno:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar alumno' },
      { status: 500 }
    );
  }
}
