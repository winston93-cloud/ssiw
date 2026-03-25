import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { queryMySQL } from '@/lib/mysql';

function sinTildes(text: string) {
  // Normaliza y elimina diacríticos para que "miércoles" matchee con "miercoles"
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const hoy = new Date();
    const fechaParam = request.nextUrl.searchParams.get('fecha');
    const fechaHoy = fechaParam || hoy.toISOString().split('T')[0]; // YYYY-MM-DD

    // Usar 12:00 para evitar saltos por zona horaria al parsear YYYY-MM-DD
    const fechaObj = new Date(`${fechaHoy}T12:00:00`);
    const diaSemana = fechaObj.toLocaleDateString('es-MX', { weekday: 'long' }).toLowerCase();
    const diaSemanaSinTildes = sinTildes(diaSemana);

    console.log('Fecha hoy:', fechaHoy, 'Día:', diaSemana, 'Día (sin tildes):', diaSemanaSinTildes);

    // 1. Obtener registros PERMANENTES activos que incluyan el día de hoy
    const { data: permanentesAccento, error: errorPermAccento } = await insforge.database
      .from('registro_salida_pie')
      .select('*')
      .eq('tipo_registro', 'permanente')
      .eq('activo', true)
      .contains('dias_semana', [diaSemanaSinTildes]);

    if (errorPermAccento) console.error('Error permanentes (sin tildes):', errorPermAccento);

    let permanentes = permanentesAccento || [];

    // Si existen registros con el acento (ej: "miércoles"), los incluimos también.
    if (diaSemanaSinTildes !== diaSemana) {
      const { data: permanentesConAcento, error: errorPermAcento } = await insforge.database
        .from('registro_salida_pie')
        .select('*')
        .eq('tipo_registro', 'permanente')
        .eq('activo', true)
        .contains('dias_semana', [diaSemana]);

      if (errorPermAcento) console.error('Error permanentes (con acento):', errorPermAcento);
      permanentes = [...permanentes, ...(permanentesConAcento || [])];
    }

    // 2. Obtener registros EVENTUALES activos que incluyan la fecha de hoy
    const { data: eventuales, error: errorEv } = await insforge.database
      .from('registro_salida_pie')
      .select('*')
      .eq('tipo_registro', 'eventual')
      .eq('activo', true)
      .contains('fechas_especificas', [fechaHoy]);

    if (errorEv) {
      console.error('Error eventuales:', errorEv);
    }

    // 3. Combinar y eliminar duplicados
    const todosRegistros = [...(permanentes || []), ...(eventuales || [])];
    
    // Eliminar duplicados por alumno_ref
    const registrosUnicos = todosRegistros.reduce((acc: any[], curr: any) => {
      if (!acc.find((r: any) => r.alumno_ref === curr.alumno_ref)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    // 4. Obtener datos de alumnos desde MySQL
    const alumnosConDatos = await Promise.all(
      registrosUnicos.map(async (reg: any) => {
        const { data: alumnoData } = await queryMySQL(
          'SELECT * FROM alumno WHERE alumno_ref = ? LIMIT 1',
          [reg.alumno_ref]
        );
        
        const alumno = alumnoData && (alumnoData as any[]).length > 0 ? (alumnoData as any[])[0] : null;
        
        // Determinar nivel educativo y formatear grado
        let nivelEducativo = 'Sin nivel';
        let gradoFormateado = '?';
        
        if (alumno) {
          const nivel = parseInt(alumno.alumno_nivel) || 0;
          const grado = parseInt(alumno.alumno_grado) || parseInt(alumno.grado) || 0;
          
          switch (nivel) {
            case 1: // Maternal
              nivelEducativo = 'Maternal';
              gradoFormateado = grado === 1 ? 'Maternal A' : grado === 2 ? 'Maternal B' : `Mat ${grado}`;
              break;
            case 2: // Kinder
              nivelEducativo = 'Kinder';
              gradoFormateado = `Kinder ${grado}`;
              break;
            case 3: // Primaria
              nivelEducativo = 'Primaria';
              const ordinales = ['', '1er', '2do', '3er', '4to', '5to', '6to'];
              gradoFormateado = ordinales[grado] ? `${ordinales[grado]} Grado` : `${grado}° Grado`;
              break;
            case 4: // Secundaria
              nivelEducativo = 'Secundaria';
              if (grado === 7) {
                gradoFormateado = '7mo. Grado';
              } else if (grado === 8) {
                gradoFormateado = '8vo. Grado';
              } else if (grado === 9) {
                gradoFormateado = '9no. Grado';
              } else {
                gradoFormateado = `${grado}° Grado`;
              }
              break;
          }
        }
        
        // Convertir grupo numérico a letra: 1->A, 2->B, 3->C
        const grupoNumerico = alumno?.grupo || alumno?.alumno_grupo || '';
        const grupoLetra = grupoNumerico === 1 || grupoNumerico === '1' ? 'A' 
                         : grupoNumerico === 2 || grupoNumerico === '2' ? 'B'
                         : grupoNumerico === 3 || grupoNumerico === '3' ? 'C'
                         : grupoNumerico;
        
        return {
          alumno_ref: reg.alumno_ref,
          nombre_completo: alumno?.alumno_nombre_completo || alumno?.nombre_completo || `${alumno?.alumno_nombre || ''} ${alumno?.alumno_app || ''} ${alumno?.alumno_apm || ''}`.trim() || 'Sin nombre',
          grado: gradoFormateado,
          grupo: grupoLetra,
          nivel_educativo: nivelEducativo,
          tipo_registro: reg.tipo_registro
        };
      })
    );

    // 5. Obtener entregas ya realizadas hoy
    const { data: entregasHoy } = await insforge.database
      .from('entregas_alumnos')
      .select('alumno_ref')
      .eq('fecha', fechaHoy);

    const entregados = new Set(entregasHoy?.map((e: any) => e.alumno_ref) || []);

    // 6. Marcar los que ya fueron entregados
    const alumnos = alumnosConDatos.map((alumno: any) => ({
      ...alumno,
      entregado: entregados.has(alumno.alumno_ref)
    }));

    // 7. Ordenar por grado y nombre
    alumnos.sort((a: any, b: any) => {
      const gradoA = parseInt(a.grado) || 0;
      const gradoB = parseInt(b.grado) || 0;
      if (gradoA !== gradoB) return gradoA - gradoB;
      return a.nombre_completo.localeCompare(b.nombre_completo);
    });

    return NextResponse.json({
      success: true,
      fecha: fechaHoy,
      dia: diaSemana,
      total: alumnos.length,
      entregados: alumnos.filter((a: any) => a.entregado).length,
      pendientes: alumnos.filter((a: any) => !a.entregado).length,
      alumnos
    });
  } catch (error: any) {
    console.error('Error al obtener entregas del día:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
