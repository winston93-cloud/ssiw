import { NextRequest, NextResponse } from 'next/server';
import { createDbServiciosAdmin } from '@/lib/insforge';
import { isErrorResponse, requireAlumnoSession } from '@/lib/ssiwSession';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      familiar_id,
      tutor_id,
      familiar_nombre,
      familiar_app,
      familiar_apm,
      familiar_tel,
      familiar_cel,
      familiar_email,
    } = body;

    const auth = requireAlumnoSession(request);
    if (isErrorResponse(auth)) return auth;

    if (!familiar_id || !familiar_nombre) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
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
      .update({
        tutor_id: tutor_id || 0,
        familiar_nombre,
        familiar_app: familiar_app || '',
        familiar_apm: familiar_apm || '',
        familiar_tel: familiar_tel || '',
        familiar_cel: familiar_cel || '',
        familiar_email: familiar_email || '',
      })
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
    console.error('Error al actualizar familiar:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
