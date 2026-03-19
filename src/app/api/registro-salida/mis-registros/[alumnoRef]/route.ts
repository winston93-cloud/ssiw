import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alumnoRef: string }> }
) {
  try {
    const { alumnoRef } = await params;

    const { data: registros, error } = await insforge.database
      .from('registro_salida_pie')
      .select('*')
      .eq('alumno_ref', alumnoRef)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener registros:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener registros' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: registros || [],
    });
  } catch (error) {
    console.error('Error en mis-registros:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
