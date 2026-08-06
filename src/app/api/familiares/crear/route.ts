import { NextRequest, NextResponse } from 'next/server';
import { createDbServiciosAdmin } from '@/lib/insforge';
import { isErrorResponse, requireAlumnoSession } from '@/lib/ssiwSession';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      alumno_id,
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

    if (!alumno_id || !familiar_nombre) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    if (Number(alumno_id) !== Number(auth.alumno_id)) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    const fechaHoy = new Date().toISOString().split('T')[0];
    const db = createDbServiciosAdmin();
    const { data, error } = await db
      .from('alumno_familiar')
      .insert({
        alumno_id,
        tutor_id: tutor_id > 0 ? tutor_id : null,
        familiar_nombre,
        familiar_app: familiar_app || '',
        familiar_apm: familiar_apm || '',
        familiar_tel: familiar_tel || '',
        familiar_cel: familiar_cel || '',
        familiar_email: familiar_email || '',
        familiar_recibir_email: 0,
        familiar_vive: 1,
        familiar_factura: 0,
        familiar_registro: fechaHoy,
      })
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || String(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
