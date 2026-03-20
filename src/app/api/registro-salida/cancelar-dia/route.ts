import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, dia } = body;

    // Obtener registro con bloqueo para evitar race conditions
    const { data: registro, error: fetchError } = await insforge.database
      .from('registro_salida_pie')
      .select('*')
      .eq('id', id)
      .eq('activo', true) // Solo si está activo
      .single();

    if (fetchError || !registro) {
      return NextResponse.json(
        { success: false, error: 'Registro no encontrado o ya inactivo' },
        { status: 404 }
      );
    }

    if (registro.tipo_registro === 'permanente') {
      // Verificar que el día a cancelar exista en el array
      if (!registro.dias_semana || !registro.dias_semana.includes(dia)) {
        return NextResponse.json(
          { success: false, error: 'El día no está en el registro' },
          { status: 400 }
        );
      }

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
        // Si ya no quedan días, desactivar y limpiar el array
        const { error: updateError } = await insforge.database
          .from('registro_salida_pie')
          .update({ 
            activo: false,
            dias_semana: []
          })
          .eq('id', id)
          .eq('activo', true); // Verificar que siga activo

        if (updateError) {
          return NextResponse.json(
            { success: false, error: 'Error al desactivar registro' },
            { status: 500 }
          );
        }
      } else {
        // Actualizar días y contador
        const { error: updateError } = await insforge.database
          .from('registro_salida_pie')
          .update({
            dias_semana: nuevosDias,
            cancelaciones_usadas: registro.cancelaciones_usadas + 1
          })
          .eq('id', id)
          .eq('activo', true); // Verificar que siga activo

        if (updateError) {
          return NextResponse.json(
            { success: false, error: 'Error al actualizar registro' },
            { status: 500 }
          );
        }
      }
    } else {
      // Eventual: simplemente desactivar
      const { error: updateError } = await insforge.database
        .from('registro_salida_pie')
        .update({ activo: false })
        .eq('id', id)
        .eq('activo', true); // Verificar que siga activo

      if (updateError) {
        return NextResponse.json(
          { success: false, error: 'Error al desactivar registro' },
          { status: 500 }
        );
      }
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
