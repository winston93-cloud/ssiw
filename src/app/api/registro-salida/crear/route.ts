import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alumno_ref, tipo_registro, dias_semana, nombre_tutor, email_tutor, telefono_tutor } = body;

    if (!alumno_ref || !tipo_registro || !dias_semana || dias_semana.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    if (dias_semana.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Máximo 5 días permitidos' },
        { status: 400 }
      );
    }

    // Verificar que el alumno existe
    const { data: alumno, error: alumnoError } = await supabase
      .from('alumno')
      .select('*')
      .eq('alumno_ref', alumno_ref)
      .single();

    if (alumnoError || !alumno) {
      return NextResponse.json(
        { success: false, error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    // Si es permanente, verificar que no haya otro registro permanente activo
    if (tipo_registro === 'permanente') {
      const { data: existente } = await supabase
        .from('registro_salida_pie')
        .select('*')
        .eq('alumno_ref', alumno_ref)
        .eq('tipo_registro', 'permanente')
        .eq('activo', true)
        .single();

      if (existente) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un registro permanente activo. Elimínelo primero.' },
          { status: 400 }
        );
      }
    }

    // Crear registro
    const { data: registro, error: registroError } = await supabase
      .from('registro_salida_pie')
      .insert({
        alumno_ref,
        tipo_registro,
        dias_semana,
        nombre_tutor,
        email_tutor,
        telefono_tutor,
        activo: true,
      })
      .select()
      .single();

    if (registroError) {
      console.error('Error al crear registro:', registroError);
      return NextResponse.json(
        { success: false, error: 'Error al crear el registro' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registro creado exitosamente',
      data: registro,
    });
  } catch (error) {
    console.error('Error en crear registro:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
