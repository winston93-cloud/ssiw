-- Eliminar tabla anterior si existe
DROP TABLE IF EXISTS public.registro_salida CASCADE;

-- Nueva tabla para registro de salida a pie
CREATE TABLE IF NOT EXISTS public.registro_salida_pie (
  id BIGSERIAL PRIMARY KEY,
  alumno_ref TEXT NOT NULL REFERENCES public.alumno(alumno_ref) ON DELETE CASCADE,
  tipo_registro TEXT NOT NULL CHECK (tipo_registro IN ('permanente', 'eventual')),
  dias_semana TEXT[], -- Para permanente: días de la semana
  fechas_especificas DATE[], -- Para eventual: fechas específicas
  cancelaciones_usadas INT DEFAULT 0, -- Para permanente: máximo 5
  activo BOOLEAN DEFAULT TRUE,
  nombre_tutor TEXT NOT NULL,
  email_tutor TEXT NOT NULL,
  telefono_tutor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT max_5_dias CHECK (
    (tipo_registro = 'eventual') OR 
    (tipo_registro = 'permanente' AND array_length(dias_semana, 1) <= 5)
  ),
  CONSTRAINT max_5_cancelaciones CHECK (
    (tipo_registro = 'eventual') OR 
    (tipo_registro = 'permanente' AND cancelaciones_usadas <= 5)
  )
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_registro_salida_pie_alumno_ref 
  ON public.registro_salida_pie(alumno_ref);

CREATE INDEX IF NOT EXISTS idx_registro_salida_pie_activo 
  ON public.registro_salida_pie(activo);

CREATE INDEX IF NOT EXISTS idx_registro_salida_pie_tipo 
  ON public.registro_salida_pie(tipo_registro);

-- Constraint único: un alumno solo puede tener un registro permanente activo
CREATE UNIQUE INDEX IF NOT EXISTS idx_registro_salida_pie_permanente_unico 
  ON public.registro_salida_pie(alumno_ref) 
  WHERE tipo_registro = 'permanente' AND activo = TRUE;

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_registro_salida_pie_updated_at ON public.registro_salida_pie;
CREATE TRIGGER update_registro_salida_pie_updated_at 
  BEFORE UPDATE ON public.registro_salida_pie 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE public.registro_salida_pie IS 'Registro de salida a pie de alumnos (permanente o eventual)';
COMMENT ON COLUMN public.registro_salida_pie.tipo_registro IS 'permanente: se repite cada semana | eventual: semanas específicas';
COMMENT ON COLUMN public.registro_salida_pie.dias_semana IS 'Array de días para registro permanente (máximo 5)';
COMMENT ON COLUMN public.registro_salida_pie.fecha_inicio IS 'Para eventual: fecha inicio de semana';
COMMENT ON COLUMN public.registro_salida_pie.fecha_fin IS 'Para eventual: fecha fin de semana';
COMMENT ON COLUMN public.registro_salida_pie.activo IS 'Si el registro está activo o fue dado de baja';
