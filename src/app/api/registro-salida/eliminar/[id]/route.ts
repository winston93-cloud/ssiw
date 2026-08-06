import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { isErrorResponse, requireAlumnoSession } from '@/lib/ssiwSession';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const auth = requireAlumnoSession(request);
    if (isErrorResponse(auth)) return auth;

    const { data: registro, error: fetchError } = await insforge.database
      .from('registro_salida_pie')
      .select('id, alumno_ref')
      .eq('id', parseInt(id))
      .single();

    if (fetchError || !registro) {
      return NextResponse.json(
        { success: false, error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    if (String(registro.alumno_ref) !== String(auth.alumno_ref)) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

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
