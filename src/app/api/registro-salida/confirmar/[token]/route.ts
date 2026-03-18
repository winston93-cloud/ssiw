import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Buscar el registro con el token
    const { data: registro, error } = await supabase
      .from('registro_salida')
      .select('*')
      .eq('token_confirmacion', token)
      .single();

    if (error || !registro) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 404 }
      );
    }

    // Verificar si ya está confirmado
    if (registro.confirmado) {
      return NextResponse.json(
        { success: false, error: 'Este registro ya ha sido confirmado' },
        { status: 400 }
      );
    }

    // Verificar si el token ha expirado
    const ahora = new Date();
    const expiracion = new Date(registro.token_expiracion);
    if (ahora > expiracion) {
      return NextResponse.json(
        { success: false, error: 'El token ha expirado' },
        { status: 400 }
      );
    }

    // Confirmar el registro
    const { error: updateError } = await supabase
      .from('registro_salida')
      .update({ 
        confirmado: true,
        fecha_confirmacion: new Date().toISOString()
      })
      .eq('id', registro.id);

    if (updateError) {
      console.error('Error al confirmar registro:', updateError);
      return NextResponse.json(
        { success: false, error: 'Error al confirmar el registro' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registro confirmado exitosamente',
      data: registro,
    });
  } catch (error) {
    console.error('Error en confirmar registro:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
