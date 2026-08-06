import { NextRequest, NextResponse } from 'next/server';
import { createDbServiciosAdmin } from '@/lib/insforge';
import { isErrorResponse, requireAlumnoSession } from '@/lib/ssiwSession';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familiar_id = searchParams.get('familiar_id');

    const auth = requireAlumnoSession(request);
    if (isErrorResponse(auth)) return auth;

    if (!familiar_id) {
      return NextResponse.json(
        { success: false, error: 'Falta familiar_id' },
        { status: 400 }
      );
    }

    const db = createDbServiciosAdmin();
    const { data: familiar, error: fetchError } = await db
      .from('alumno_familiar')
      .select('familiar_id, alumno_id')
      .eq('familiar_id', familiar_id)
      .limit(1)
      .maybeSingle();

    if (fetchError || !familiar) {
      return NextResponse.json(
        { success: false, error: 'Familiar no encontrado' },
        { status: 404 }
      );
    }
    if (Number(familiar.alumno_id) !== Number(auth.alumno_id)) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { data, error } = await db
      .from('alumno_familiar')
      .delete()
      .eq('familiar_id', familiar_id)
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || String(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error al eliminar familiar:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
