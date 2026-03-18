import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { enviarCorreoConfirmacion } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alumno_ref, fecha, nombre_tutor, email_tutor, telefono_tutor } = body;

    if (!alumno_ref || !fecha || !nombre_tutor || !email_tutor || !telefono_tutor) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
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

    // Verificar que no haya un registro confirmado para esa fecha
    const { data: registroExistente } = await supabase
      .from('registro_salida')
      .select('*')
      .eq('alumno_ref', alumno_ref)
      .eq('fecha', fecha)
      .eq('confirmado', true)
      .single();

    if (registroExistente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un registro confirmado para esta fecha' },
        { status: 400 }
      );
    }

    // Generar token de confirmación
    const token = crypto.randomBytes(32).toString('hex');
    const token_expiracion = new Date();
    token_expiracion.setHours(token_expiracion.getHours() + 24);

    // Crear registro pendiente
    const { data: registro, error: registroError } = await supabase
      .from('registro_salida')
      .insert({
        alumno_ref,
        fecha,
        nombre_tutor,
        email_tutor,
        telefono_tutor,
        token_confirmacion: token,
        token_expiracion: token_expiracion.toISOString(),
        confirmado: false,
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

    // Enviar correo de confirmación
    const nombreCompleto = alumno.alumno_nombre_completo || 
      `${alumno.alumno_nombre} ${alumno.alumno_app} ${alumno.alumno_apm}`;

    try {
      await enviarCorreoConfirmacion({
        email: email_tutor,
        nombreTutor: nombre_tutor,
        nombreAlumno: nombreCompleto,
        fecha,
        token,
      });
    } catch (emailError) {
      console.error('Error al enviar correo:', emailError);
      // No fallar si el correo no se envía
    }

    return NextResponse.json({
      success: true,
      message: 'Registro creado. Por favor revise su correo para confirmar.',
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
