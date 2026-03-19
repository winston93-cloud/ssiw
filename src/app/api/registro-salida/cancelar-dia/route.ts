import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, dia } = body;

    // Verificar hora límite
    const ahora = new Date();
    if (ahora.getHours() >= 13) {
      return NextResponse.json(
        { success: false, error: 'Solo puede cancelar antes de la 1:00 PM' },
        { status: 400 }
      );
    }

    // Obtener registro
    const { data: registro, error: fetchError } = await insforge
      .from('registro_salida_pie')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !registro) {
      return NextResponse.json(
        { success: false, error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    if (registro.tipo_registro === 'permanente') {
      // Verificar límite de cancelaciones
      if (registro.cancelaciones_usadas >= 5) {
        return NextResponse.json(
          { success: false, error: 'Ya usó las 5 cancelaciones permitidas' },
          { status: 400 }
        );
      }

      // Remover el día del array
      const nuevosDias = registro.dias_semana.filter((d: string) => d !== dia);
      
      if (nuevosDias.length === 0) {
        // Si ya no quedan días, desactivar
        await insforge
          .from('registro_salida_pie')
          .update({ activo: false })
          .eq('id', id);
      } else {
        // Actualizar días y contador
        await insforge
          .from('registro_salida_pie')
          .update({
            dias_semana: nuevosDias,
            cancelaciones_usadas: registro.cancelaciones_usadas + 1
          })
          .eq('id', id);
      }
    } else {
      // Eventual: simplemente desactivar
      await insforge
        .from('registro_salida_pie')
        .update({ activo: false })
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      message: 'Cancelado exitosamente',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar' },
      { status: 500 }
    );
  }
}
