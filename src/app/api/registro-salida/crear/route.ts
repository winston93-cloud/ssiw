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

      // Buscar TODOS los permanentes del alumno (activos e inactivos)
      const { data: todosLosPermanentes } = await insforge.database
        .from('registro_salida_pie')
        .select('*')
        .eq('alumno_ref', alumno_ref)
        .eq('tipo_registro', 'permanente');

      if (todosLosPermanentes && todosLosPermanentes.length > 0) {
        // Separar activos y válidos
        const activosValidos = todosLosPermanentes.filter(
          r => r.activo && r.dias_semana && r.dias_semana.length > 0
        );

        // Si hay un activo válido, rechazar
        if (activosValidos.length > 0) {
          return NextResponse.json(
            { success: false, error: 'Ya existe un registro permanente activo' },
            { status: 400 }
          );
        }

        // Limpiar TODOS los registros inválidos o inactivos antes de crear el nuevo
        const idsALimpiar = todosLosPermanentes.map(r => r.id);
        await insforge.database
          .from('registro_salida_pie')
          .delete()
          .in('id', idsALimpiar);
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

      // Buscar TODOS los eventuales del alumno
      const { data: todosLosEventuales } = await insforge.database
        .from('registro_salida_pie')
        .select('*')
        .eq('alumno_ref', alumno_ref)
        .eq('tipo_registro', 'eventual');

      // Si hay registros eventuales existentes
      if (todosLosEventuales && todosLosEventuales.length > 0) {
        // Obtener registros activos y válidos
        const activosValidos = todosLosEventuales.filter(
          r => r.activo && r.fechas_especificas && r.fechas_especificas.length > 0
        );

        if (activosValidos.length > 0) {
          // Consolidar: tomar el primero y agregar las nuevas fechas
          const registroPrincipal = activosValidos[0];
          const todasLasFechas = activosValidos.flatMap(r => r.fechas_especificas || []);
          const fechasConsolidadas = [...new Set([...todasLasFechas, ...fechas])];

          // Eliminar TODOS los eventuales (vamos a recrear el principal)
          await insforge.database
            .from('registro_salida_pie')
            .delete()
            .eq('alumno_ref', alumno_ref)
            .eq('tipo_registro', 'eventual');

          // Crear nuevo registro limpio con todas las fechas
          const { data: nuevoRegistro, error: insertError } = await insforge.database
            .from('registro_salida_pie')
            .insert({
              alumno_ref,
              tipo_registro: 'eventual',
              activo: true,
              fechas_especificas: fechasConsolidadas,
              nombre_tutor: 'N/A',
              email_tutor: 'N/A',
              telefono_tutor: 'N/A'
            })
            .select()
            .single();

          if (insertError) {
            return NextResponse.json(
              { success: false, error: 'Error al consolidar fechas' },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            message: 'Fechas agregadas y duplicados eliminados',
            data: nuevoRegistro,
          });
        }

        // Si solo hay inactivos o vacíos, eliminarlos
        await insforge.database
          .from('registro_salida_pie')
          .delete()
          .eq('alumno_ref', alumno_ref)
          .eq('tipo_registro', 'eventual');
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
