import { NextRequest, NextResponse } from 'next/server';
import { insforge, fetchAlumnoByRef } from '@/lib/insforge';
import {
  diasSemanaNormalizados,
  normalizarDiaSemana,
} from '@/lib/dias-semana-pie';
import { isErrorResponse, requireAlumnoSession } from '@/lib/ssiwSession';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const alumno_ref = String(body?.alumno_ref ?? '').trim();
    const accion = body?.accion === 'desactivar' ? 'desactivar' : 'activar';
    const dia = normalizarDiaSemana(String(body?.dia ?? ''));

    if (!alumno_ref || !dia) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos.' },
        { status: 400 }
      );
    }

    const auth = requireAlumnoSession(request, alumno_ref);
    if (isErrorResponse(auth)) return auth;

    const { data: alumno, error: alumnoError } = await fetchAlumnoByRef(alumno_ref);
    if (alumnoError || !alumno) {
      return NextResponse.json(
        { success: false, error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    const { data: registro, error: fetchError } = await insforge.database
      .from('registro_salida_pie')
      .select('*')
      .eq('alumno_ref', alumno_ref)
      .eq('tipo_registro', 'permanente')
      .eq('activo', true)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    if (accion === 'activar') {
      const ahora = new Date().toISOString();
      const diasActuales = diasSemanaNormalizados(registro?.dias_semana);

      if (diasActuales.includes(dia)) {
        return NextResponse.json({
          success: true,
          message: 'El día ya está activo.',
          registro: registro,
        });
      }

      const nuevosDias = [...diasActuales, dia];

      if (!registro) {
        const { data: creado, error: insErr } = await insforge.database
          .from('registro_salida_pie')
          .insert([
            {
              alumno_ref,
              tipo_registro: 'permanente',
              dias_semana: nuevosDias,
              cancelaciones_usadas: 0,
              activo: true,
              nombre_tutor: 'N/A',
              email_tutor: 'N/A',
              telefono_tutor: 'N/A',
            },
          ])
          .select('*')
          .maybeSingle();

        if (insErr) {
          return NextResponse.json(
            { success: false, error: insErr.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Día activado.',
          registro: creado,
        });
      }

      const { data: actualizado, error: upErr } = await insforge.database
        .from('registro_salida_pie')
        .update({
          dias_semana: nuevosDias,
          updated_at: ahora,
        })
        .eq('id', registro.id)
        .select('*')
        .maybeSingle();

      if (upErr) {
        return NextResponse.json(
          { success: false, error: upErr.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Día activado.',
        registro: actualizado,
      });
    }

    // desactivar
    if (!registro) {
      return NextResponse.json(
        { success: false, error: 'No hay registro permanente activo.' },
        { status: 404 }
      );
    }

    const diasActuales = diasSemanaNormalizados(registro.dias_semana);
    if (!diasActuales.includes(dia)) {
      return NextResponse.json(
        { success: false, error: 'El día no está activo.' },
        { status: 400 }
      );
    }

    if ((registro.cancelaciones_usadas || 0) >= 5) {
      return NextResponse.json(
        { success: false, error: 'Ya usó las 5 cancelaciones permitidas.' },
        { status: 400 }
      );
    }

    const nuevosDias = diasActuales.filter((d) => d !== dia);

    if (nuevosDias.length === 0) {
      const { data: actualizado, error: upErr } = await insforge.database
        .from('registro_salida_pie')
        .update({
          dias_semana: [],
          cancelaciones_usadas: (registro.cancelaciones_usadas || 0) + 1,
        })
        .eq('id', registro.id)
        .select('*')
        .maybeSingle();

      if (upErr) {
        return NextResponse.json(
          { success: false, error: upErr.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Día desactivado.',
        registro: actualizado,
      });
    }

    const { data: actualizado, error: upErr } = await insforge.database
      .from('registro_salida_pie')
      .update({
        dias_semana: nuevosDias,
        cancelaciones_usadas: (registro.cancelaciones_usadas || 0) + 1,
      })
      .eq('id', registro.id)
      .select('*')
      .maybeSingle();

    if (upErr) {
      return NextResponse.json(
        { success: false, error: upErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Día desactivado.',
      registro: actualizado,
    });
  } catch (error) {
    console.error('toggle-dia-permanente:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar' },
      { status: 500 }
    );
  }
}
