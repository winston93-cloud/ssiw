import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { queryMySQL } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alumno_ref, tipo_registro, dias_semana, fechas } = body;

    if (!alumno_ref || !tipo_registro) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar alumno en MySQL
    const { data: alumnos, error: alumnoError } = await queryMySQL(
      'SELECT * FROM alumno WHERE alumno_ref = ? LIMIT 1',
      [alumno_ref]
    );

    if (alumnoError || !alumnos || (alumnos as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }

    // Si es permanente, verificar que no haya otro activo
    if (tipo_registro === 'permanente') {
      if (!dias_semana || dias_semana.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Debe seleccionar días' },
          { status: 400 }
        );
      }

      const { data: existente } = await insforge.database
        .from('registro_salida_pie')
        .select('*')
        .eq('alumno_ref', alumno_ref)
        .eq('tipo_registro', 'permanente')
        .eq('activo', true)
        .single();

      // Si existe un permanente activo pero sin días, desactivarlo primero
      if (existente && (!existente.dias_semana || existente.dias_semana.length === 0)) {
        await insforge.database
          .from('registro_salida_pie')
          .update({ activo: false })
          .eq('id', existente.id);
      } else if (existente && existente.dias_semana && existente.dias_semana.length > 0) {
        // Solo si tiene días válidos, rechazar
        return NextResponse.json(
          { success: false, error: 'Ya existe un registro permanente activo' },
          { status: 400 }
        );
      }
    }

    // Si es eventual, solo validar fechas
    if (tipo_registro === 'eventual') {
      if (!fechas || fechas.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Debe seleccionar fechas' },
          { status: 400 }
        );
      }

      // Verificar si ya existe un eventual activo
      const { data: eventualesExistentes } = await insforge.database
        .from('registro_salida_pie')
        .select('*')
        .eq('alumno_ref', alumno_ref)
        .eq('tipo_registro', 'eventual')
        .eq('activo', true);

      // Si hay registros eventuales existentes
      if (eventualesExistentes && eventualesExistentes.length > 0) {
        // Limpiar registros vacíos (sin fechas)
        const registrosVacios = eventualesExistentes.filter(
          r => !r.fechas_especificas || r.fechas_especificas.length === 0
        );
        
        if (registrosVacios.length > 0) {
          await insforge.database
            .from('registro_salida_pie')
            .update({ activo: false })
            .in('id', registrosVacios.map(r => r.id));
        }

        // Obtener registros válidos (con fechas)
        const registrosValidos = eventualesExistentes.filter(
          r => r.fechas_especificas && r.fechas_especificas.length > 0
        );

        if (registrosValidos.length > 0) {
          // Si hay múltiples, consolidar en uno solo
          const registroPrincipal = registrosValidos[0];
          const todasLasFechas = registrosValidos.flatMap(r => r.fechas_especificas || []);
          const fechasConsolidadas = [...new Set([...todasLasFechas, ...fechas])]; // Eliminar duplicados

          // Desactivar los demás registros duplicados
          if (registrosValidos.length > 1) {
            const idsADesactivar = registrosValidos.slice(1).map(r => r.id);
            await insforge.database
              .from('registro_salida_pie')
              .update({ activo: false })
              .in('id', idsADesactivar);
          }

          // Actualizar el principal con todas las fechas
          const { error: updateError } = await insforge.database
            .from('registro_salida_pie')
            .update({ fechas_especificas: fechasConsolidadas })
            .eq('id', registroPrincipal.id);

          if (updateError) {
            return NextResponse.json(
              { success: false, error: 'Error al actualizar fechas' },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            message: 'Fechas agregadas al registro existente',
            data: { ...registroPrincipal, fechas_especificas: fechasConsolidadas },
          });
        }
      }
    }

    // Crear registro
    const dataToInsert: any = {
      alumno_ref,
      tipo_registro,
      activo: true,
    };

    if (tipo_registro === 'permanente') {
      dataToInsert.dias_semana = dias_semana;
      dataToInsert.nombre_tutor = 'N/A';
      dataToInsert.email_tutor = 'N/A';
      dataToInsert.telefono_tutor = 'N/A';
      dataToInsert.cancelaciones_usadas = 0;
    } else {
      dataToInsert.fechas_especificas = fechas;
      dataToInsert.nombre_tutor = 'N/A';
      dataToInsert.email_tutor = 'N/A';
      dataToInsert.telefono_tutor = 'N/A';
    }

    const { data: registro, error: registroError } = await insforge.database
      .from('registro_salida_pie')
      .insert(dataToInsert)
      .select()
      .single();

    if (registroError) {
      console.error('Error al crear:', registroError);
      return NextResponse.json(
        { success: false, error: 'Error al crear el registro' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registro creado',
      data: registro,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar' },
      { status: 500 }
    );
  }
}
