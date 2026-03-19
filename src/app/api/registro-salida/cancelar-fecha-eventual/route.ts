import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function POST(request: NextRequest) {
  try {
    const { id, fecha } = await request.json();

    if (!id || !fecha) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros' },
        { status: 400 }
      );
    }

    console.log('Cancelando fecha eventual:', { id, fecha });

    // Obtener el registro actual
    const { data: registroActual, error: errorGet } = await insforge.database
      .from('registro_salida_pie')
      .select('fechas_especificas, tipo_registro')
      .eq('id', id)
      .single();

    if (errorGet || !registroActual) {
      console.error('Error al obtener registro:', errorGet);
      return NextResponse.json(
        { success: false, error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    console.log('Registro actual:', registroActual);

    // Filtrar la fecha a eliminar del array
    const fechasActualizadas = (registroActual.fechas_especificas || []).filter(
      (f: string) => f !== fecha
    );

    console.log('Fechas después de filtrar:', fechasActualizadas);

    // Si no quedan fechas, desactivar el registro
    if (fechasActualizadas.length === 0) {
      console.log('No quedan fechas, desactivando registro');
      
      const { error: errorDelete } = await insforge.database
        .from('registro_salida_pie')
        .update({ 
          activo: false,
          fechas_especificas: []
        })
        .eq('id', id);

      if (errorDelete) {
        console.error('Error al desactivar registro:', errorDelete);
        return NextResponse.json(
          { success: false, error: 'Error al desactivar registro' },
          { status: 500 }
        );
      }

      console.log('Registro desactivado exitosamente');
      return NextResponse.json({ 
        success: true, 
        message: 'Última fecha eliminada, registro desactivado' 
      });
    }

    // Actualizar el array de fechas
    console.log('Actualizando fechas del registro');
    const { error: errorUpdate } = await insforge.database
      .from('registro_salida_pie')
      .update({ fechas_especificas: fechasActualizadas })
      .eq('id', id);

    if (errorUpdate) {
      console.error('Error al actualizar fechas:', errorUpdate);
      return NextResponse.json(
        { success: false, error: 'Error al actualizar fechas' },
        { status: 500 }
      );
    }

    console.log('Fechas actualizadas exitosamente');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al cancelar fecha eventual:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error del servidor' },
      { status: 500 }
    );
  }
}
