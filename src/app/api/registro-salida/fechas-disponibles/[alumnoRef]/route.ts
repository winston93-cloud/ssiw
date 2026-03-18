import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { alumnoRef: string } }
) {
  try {
    const { alumnoRef } = params;
    const { searchParams } = new URL(request.url);
    const mes = parseInt(searchParams.get('mes') || '0');
    const anio = parseInt(searchParams.get('anio') || '0');

    if (!mes || !anio) {
      return NextResponse.json(
        { success: false, error: 'Mes y año son requeridos' },
        { status: 400 }
      );
    }

    // Calcular fechas de inicio y fin del mes
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0);

    // Obtener registros confirmados del alumno en ese mes
    const { data: registros, error } = await supabase
      .from('registro_salida')
      .select('fecha')
      .eq('alumno_ref', alumnoRef)
      .eq('confirmado', true)
      .gte('fecha', fechaInicio.toISOString().split('T')[0])
      .lte('fecha', fechaFin.toISOString().split('T')[0]);

    if (error) {
      console.error('Error al obtener fechas:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener fechas' },
        { status: 500 }
      );
    }

    const fechasRegistradas = registros?.map(r => r.fecha) || [];

    return NextResponse.json({
      success: true,
      data: fechasRegistradas,
    });
  } catch (error) {
    console.error('Error en fechas disponibles:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
