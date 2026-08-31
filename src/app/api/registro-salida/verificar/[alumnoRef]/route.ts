import { NextRequest, NextResponse } from 'next/server';
import { fetchAlumnoByRef, nombreCompletoAlumno } from '@/lib/insforge';
import {
  applySessionCookie,
  signSession,
} from '@/lib/ssiwSession';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alumnoRef: string }> }
) {
  try {
    const { alumnoRef } = await params;

    const { data: alumnoRow, error } = await fetchAlumnoByRef(alumnoRef);

    if (error || !alumnoRow) {
      return NextResponse.json(
        { success: false, error: 'Número de control no encontrado' },
        { status: 404 }
      );
    }

    const alumno = {
      ...alumnoRow,
      alumno_nombre_completo: nombreCompletoAlumno(alumnoRow as any),
      alumno_ref: String(alumnoRow.alumno_ref ?? alumnoRef),
      alumno_id: Number(alumnoRow.alumno_id),
    };

    const displayName = nombreCompletoAlumno(alumno as any);

    const sessionToken = signSession({
      role: 'alumno',
      displayName,
      alumno_ref: String(alumno.alumno_ref),
      alumno_id: alumno.alumno_id,
    });

    const res = NextResponse.json({
      success: true,
      tipo: 'alumno',
      data: alumno,
    });
    applySessionCookie(res, sessionToken);
    return res;
  } catch (error) {
    console.error('Error al verificar:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar' },
      { status: 500 }
    );
  }
}
