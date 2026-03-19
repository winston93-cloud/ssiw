import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar hora límite (1pm)
    // const ahora = new Date();
    // const horaActual = ahora.getHours();
    
    // if (horaActual >= 13) {
    //   return NextResponse.json(
    //     { success: false, error: 'Solo puede eliminar antes de la 1:00 PM' },
    //     { status: 400 }
    //   );
    // }

    // Marcar como inactivo en lugar de eliminar
    const { error } = await insforge.database
      .from('registro_salida_pie')
      .update({ activo: false })
      .eq('id', parseInt(id));

    if (error) {
      console.error('Error al eliminar registro:', error);
      return NextResponse.json(
        { success: false, error: 'Error al eliminar el registro' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registro eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error en eliminar:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
