# InsForge - Documentación del Proyecto

## ¿Qué es InsForge?

InsForge es un **Backend-as-a-Service (BaaS)** diseñado específicamente para ser "AI-first" o "agent-native". Es similar a Supabase, pero optimizado para que los agentes de IA (como Claude, Cursor, Grok) lo entiendan y manejen automáticamente sin necesidad de explicaciones exhaustivas.

### Características principales:
- **PostgreSQL database** con schemas, RLS (Row Level Security), triggers
- **Auth** (email/password, OAuth como Google/GitHub, JWT)
- **Storage** (archivos, buckets S3-compatible)
- **Realtime** (suscripciones en tiempo real)
- **Edge Functions** (serverless functions para lógica custom)
- **Model Gateway** (integración directa con modelos IA)
- **MCP (Model Context Protocol)** 🌟 - La característica clave

## ¿Qué es MCP (Model Context Protocol)?

MCP es una capa semántica que le da al agente de IA contexto estructurado automáticamente:
- Schema actual de la base de datos
- Políticas RLS activas
- Logs de errores recientes
- Estado del sistema
- Historia de cambios

**Resultado**: Los agentes pueden razonar mejor y actuar más rápido sin necesidad de prompts extensos. Según benchmarks oficiales, es **1.6× más rápido y 1.7× más preciso** que usar Supabase con agentes.

## Por qué usamos InsForge en este proyecto

Este proyecto (`ssiw`) migró de **Supabase** a **InsForge** para la tabla `registro_salida_pie`, mientras mantiene la tabla `alumno` en **MySQL** (hosting externo `www.winston93.edu.mx`).

**Motivos de la migración:**
1. **Desarrollo más rápido con agentes**: El MCP permite que Claude/Cursor entienda el schema automáticamente
2. **Mejor integración con Cursor**: El CLI de InsForge se conecta directamente con el proyecto
3. **Testing de nueva tecnología**: Explorar herramientas "agent-native" para desarrollo moderno

## Configuración actual del proyecto

### 1. Credenciales (`.env.local`)

```env
# InsForge Configuration
NEXT_PUBLIC_INSFORGE_URL=https://xkeq76zc.us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_ead876e3b0d3842e8f5abcdabdeeeaaa
INSFORGE_PROJECT_ID=eaff450a-6684-4ede-8934-846eb8e46019
```

**Importante**: Estas mismas variables están configuradas en **Vercel** (Environment Variables).

### 2. Conexión PostgreSQL directa

```
postgresql://postgres:e72879870b2d241477c59a52e2a6a0b3@xkeq76zc.us-east.database.insforge.app:5432/insforge?sslmode=require
```

### 3. SDK en el proyecto

**Archivo**: `src/lib/insforge.ts`

```typescript
import { createClient } from '@insforge/sdk';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey
});
```

**Dependencia en `package.json`**:
```json
"@insforge/sdk": "^1.1.6"
```

### 4. Uso en API Routes

```typescript
import { insforge } from '@/lib/insforge';

// SELECT
const { data, error } = await insforge.database
  .from('registro_salida_pie')
  .select('*')
  .eq('alumno_ref', '11779')
  .eq('activo', true);

// INSERT
const { data, error } = await insforge.database
  .from('registro_salida_pie')
  .insert({
    alumno_ref: '11779',
    tipo_registro: 'permanente',
    dias_semana: ['lunes', 'martes'],
    activo: true
  });

// UPDATE
const { error } = await insforge.database
  .from('registro_salida_pie')
  .update({ activo: false })
  .eq('id', 123);

// DELETE (se usa UPDATE con activo: false)
const { error } = await insforge.database
  .from('registro_salida_pie')
  .update({ activo: false })
  .eq('id', 123);
```

## Estructura de la base de datos

### Tabla: `registro_salida_pie`

```sql
CREATE TABLE public.registro_salida_pie (
  id BIGSERIAL PRIMARY KEY,
  alumno_ref VARCHAR(50) NOT NULL,
  tipo_registro VARCHAR(20) NOT NULL CHECK (tipo_registro IN ('permanente', 'eventual')),
  dias_semana TEXT[], -- Para registros permanentes: ['lunes', 'martes', 'miércoles']
  fechas_especificas DATE[], -- Para registros eventuales: ['2026-03-23', '2026-03-24']
  cancelaciones_usadas INTEGER DEFAULT 0 CHECK (cancelaciones_usadas >= 0 AND cancelaciones_usadas <= 5),
  activo BOOLEAN DEFAULT TRUE,
  nombre_tutor VARCHAR(255),
  email_tutor VARCHAR(255),
  telefono_tutor VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_registro_salida_pie_alumno_ref ON registro_salida_pie(alumno_ref);
CREATE INDEX idx_registro_salida_pie_activo ON registro_salida_pie(activo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_registro_salida_pie_updated_at
  BEFORE UPDATE ON registro_salida_pie
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### RLS Policies (Row Level Security)

```sql
-- Permitir SELECT público
CREATE POLICY "Allow public select" 
  ON registro_salida_pie 
  FOR SELECT 
  TO anon, authenticated, public
  USING (true);

-- Permitir INSERT público
CREATE POLICY "Allow public insert" 
  ON registro_salida_pie 
  FOR INSERT 
  TO anon, authenticated, public
  WITH CHECK (true);

-- Permitir UPDATE público
CREATE POLICY "Allow public update" 
  ON registro_salida_pie 
  FOR UPDATE 
  TO anon, authenticated, public
  USING (true)
  WITH CHECK (true);

-- Permitir DELETE público
CREATE POLICY "Allow public delete" 
  ON registro_salida_pie 
  FOR DELETE 
  TO anon, authenticated, public
  USING (true);
```

### Permisos en secuencias y schemas

```sql
-- Permisos en la tabla
GRANT ALL ON registro_salida_pie TO anon, authenticated, public;

-- Permisos en la secuencia (para BIGSERIAL)
GRANT USAGE, SELECT ON SEQUENCE registro_salida_pie_id_seq TO anon, authenticated, public;

-- Permisos en el schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, public;
```

## InsForge CLI y MCP

### Instalación y enlace

El proyecto ya está enlazado con InsForge a través de `.insforge/project.json`:

```json
{
  "projectId": "eaff450a-6684-4ede-8934-846eb8e46019"
}
```

### Comandos útiles del CLI

```bash
# Verificar proyecto actual
npx @insforge/cli current

# Ejecutar SQL directamente
npx @insforge/cli db query

# Ver tablas
npx @insforge/cli db query
# Luego pega: SELECT * FROM registro_salida_pie LIMIT 10;

# Crear backup de tabla
npx @insforge/cli db query
# Luego pega: CREATE TABLE registro_salida_pie_backup AS SELECT * FROM registro_salida_pie;

# Eliminar tabla
npx @insforge/cli db query
# Luego pega: DROP TABLE nombre_tabla;

# Contar registros
npx @insforge/cli db query
# Luego pega: SELECT COUNT(*) FROM registro_salida_pie WHERE activo = true;
```

**Nota importante**: El enlace con InsForge es **persistente**. No necesitas ejecutar `link` cada vez que abres Cursor.

## Arquitectura híbrida: InsForge + MySQL

Este proyecto usa **dos bases de datos**:

### 1. **MySQL** (Hosting externo) - Tabla `alumno`

**Archivo**: `src/lib/mysql.ts`

```typescript
import mysql from 'mysql2/promise';

export async function queryMySQL(sql: string, params?: any[]) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'www.winston93.edu.mx',
      user: process.env.MYSQL_USER || 'winston_richard',
      password: process.env.MYSQL_PASSWORD || '101605',
      database: process.env.MYSQL_DATABASE || 'winston_general',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
    });

    const [rows] = await connection.execute(sql, params);
    return { data: rows, error: null };
  } catch (error: any) {
    console.error('MySQL Error:', error);
    return { data: null, error: error.message };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
```

**Variables de entorno** (`.env.local`):
```env
MYSQL_HOST=www.winston93.edu.mx
MYSQL_USER=winston_richard
MYSQL_PASSWORD=101605
MYSQL_DATABASE=winston_general
MYSQL_PORT=3306
```

### 2. **InsForge** (PostgreSQL) - Tabla `registro_salida_pie`

Ver sección anterior.

### Ejemplo de uso combinado en API

```typescript
import { insforge } from '@/lib/insforge';
import { queryMySQL } from '@/lib/mysql';

// Verificar si el alumno existe (MySQL)
const { data: alumnoData } = await queryMySQL(
  'SELECT * FROM alumno WHERE alumno_ref = ?',
  [alumnoRef]
);

if (!alumnoData || alumnoData.length === 0) {
  return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 });
}

// Crear registro de salida (InsForge)
const { data, error } = await insforge.database
  .from('registro_salida_pie')
  .insert({
    alumno_ref: alumnoRef,
    tipo_registro: 'permanente',
    dias_semana: ['lunes', 'martes'],
    activo: true
  });
```

## Diferencias clave: InsForge vs Supabase

| Aspecto | InsForge | Supabase |
|---------|----------|----------|
| **Cliente JS** | `@insforge/sdk` | `@supabase/supabase-js` |
| **Sintaxis database** | `insforge.database.from('tabla')` | `supabase.from('tabla')` |
| **MCP integrado** | ✅ Sí | ❌ No |
| **CLI agent-native** | ✅ Sí (`npx @insforge/cli`) | Dashboard UI principalmente |
| **Velocidad con agentes** | 1.6× más rápido | Baseline |
| **Precisión con agentes** | 1.7× más preciso | Baseline |
| **Comunidad/madurez** | Nueva (2025-2026) | Madura (años) |

## Errores comunes y soluciones

### Error: `permission denied for sequence registro_salida_pie_id_seq`

**Causa**: Los roles `anon`, `authenticated` no tienen permisos sobre la secuencia del `BIGSERIAL`.

**Solución**:
```sql
GRANT USAGE, SELECT ON SEQUENCE registro_salida_pie_id_seq TO anon, authenticated, public;
GRANT ALL ON registro_salida_pie TO anon, authenticated, public;
```

### Error: `TypeError: Property 'from' does not exist`

**Causa**: Usar sintaxis de Supabase en vez de InsForge.

**Incorrecto**: `insforge.from('tabla')`  
**Correcto**: `insforge.database.from('tabla')`

### Error: `ENOTFOUND xkeq76cc-us-east.insforge.app`

**Causa**: Typo en la URL (era `xkeq76cc` en vez de `xkeq76zc`).

**Solución**: Verificar que `NEXT_PUBLIC_INSFORGE_URL` esté correctamente configurado en `.env.local` y en Vercel.

### Error: Registro no se elimina cuando borro última fecha eventual

**Causa**: No se estaba desactivando el registro cuando `fechas_especificas` quedaba vacío.

**Solución**: Implementada en `cancelar-fecha-eventual/route.ts`:
```typescript
if (fechasActualizadas.length === 0) {
  await insforge.database
    .from('registro_salida_pie')
    .update({ 
      activo: false,
      fechas_especificas: []
    })
    .eq('id', id);
}
```

## Lógica de negocio implementada

### Registro Permanente
- **Límite**: Solo 1 registro permanente por alumno
- **Días**: Máximo 5 días de la semana
- **Cancelaciones**: Hasta 5 cancelaciones individuales permitidas
- **Comportamiento**: Se repite automáticamente cada semana de todos los meses

### Registro Eventual
- **Límite**: Sin límite de registros eventuales
- **Fechas**: Fechas específicas (ej: 23/03/2026, 25/03/2026)
- **Cancelaciones**: Al eliminar una fecha, se quita del array; al eliminar la última, se desactiva el registro completo
- **Validación**: Solo días entre semana (lunes a viernes)

### API Endpoints

```
POST /api/registro-salida/crear
- Crea un nuevo registro (permanente o eventual)
- Valida que el alumno exista en MySQL
- Valida que no exista un permanente si se intenta crear uno

GET /api/registro-salida/mis-registros/[alumnoRef]
- Devuelve todos los registros activos del alumno
- Filtra por activo: true

POST /api/registro-salida/cancelar-dia
- Cancela un día específico de un registro permanente
- Incrementa cancelaciones_usadas
- Límite: 5 cancelaciones

POST /api/registro-salida/cancelar-fecha-eventual
- Elimina una fecha específica de un registro eventual
- Si era la última fecha, desactiva el registro completo

GET /api/registro-salida/verificar/[alumnoRef]
- Verifica si el alumno tiene registros activos
- Usado para validación antes de crear
```

## Dashboard de InsForge

**URL**: https://insforge.dev  
**Usuario**: (tu cuenta de GitHub/Google/Email)

**Acceso al proyecto**:
1. Ve a https://insforge.dev
2. Login con tu cuenta
3. Selecciona el proyecto `eaff450a-6684-4ede-8934-846eb8e46019`
4. Puedes ver:
   - Tables (schemas, datos)
   - SQL Editor (ejecutar queries)
   - Auth (usuarios)
   - Storage (archivos)
   - Settings (config)

**No necesitas tener el dashboard abierto** para que el CLI funcione. El enlace es persistente a través de `.insforge/project.json`.

## Para futuros agentes (Claude, Grok, etc.)

### Inicio rápido:

1. **Verifica la configuración**:
   ```bash
   npx @insforge/cli current
   ```

2. **Lee este archivo** (`INSFORGE.md`) completo

3. **Revisa el schema actual**:
   ```bash
   npx @insforge/cli db query
   # Luego: \d registro_salida_pie
   ```

4. **Sintaxis correcta para queries**:
   ```typescript
   import { insforge } from '@/lib/insforge';
   const { data, error } = await insforge.database
     .from('registro_salida_pie')
     .select('*');
   ```

5. **Arquitectura híbrida**: Recuerda que:
   - `alumno` → MySQL (usar `queryMySQL()`)
   - `registro_salida_pie` → InsForge (usar `insforge.database`)

### Comandos de diagnóstico

```bash
# Ver proyecto enlazado
npx @insforge/cli current

# Ver todas las tablas
npx @insforge/cli db query
# \dt

# Ver schema de tabla
npx @insforge/cli db query
# \d registro_salida_pie

# Contar registros activos
npx @insforge/cli db query
# SELECT COUNT(*) FROM registro_salida_pie WHERE activo = true;

# Ver últimos 10 registros
npx @insforge/cli db query
# SELECT * FROM registro_salida_pie ORDER BY created_at DESC LIMIT 10;
```

## Recursos adicionales

- **Sitio oficial**: https://insforge.dev
- **Docs**: https://docs.insforge.dev
- **GitHub**: https://github.com/InsForge/InsForge
- **Comunidad**: Discord en el sitio oficial

---

**Última actualización**: 19 de marzo de 2026  
**Proyecto**: SSIW (Sistema de Salida Instituto Winston)  
**Framework**: Next.js 16.2.0 (App Router)  
**Deployment**: Vercel (https://ssiw.vercel.app)
