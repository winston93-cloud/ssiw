import { NextRequest, NextResponse } from 'next/server';
import { createDbServiciosAdmin, fetchAlumnoByRef } from '@/lib/insforge';
import { isErrorResponse, requireAlumnoOrMaestra } from '@/lib/ssiwSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alumnoRef: string }> }
) {
  try {
    const { alumnoRef } = await params;
    const auth = requireAlumnoOrMaestra(request, alumnoRef);
    if (isErrorResponse(auth)) return auth;

    const { data: alumno, error: alumnoError } = await fetchAlumnoByRef(alumnoRef);
    if (alumnoError || !alumno) {
      return NextResponse.json(
        { success: false, error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    const alumno_id = Number(alumno.alumno_id);
    const db = createDbServiciosAdmin();
    const { data: familiares, error } = await db
      .from('alumno_familiar')
      .select(
        'familiar_id, alumno_id, tutor_id, familiar_nombre, familiar_app, familiar_apm, familiar_tel, familiar_cel, familiar_email'
      )
      .eq('alumno_id', alumno_id)
      .order('tutor_id', { ascending: true })
      .order('familiar_app', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || String(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alumno_id,
      familiares: familiares || [],
    });
  } catch (error: any) {
    console.error('Error al obtener familiares:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
