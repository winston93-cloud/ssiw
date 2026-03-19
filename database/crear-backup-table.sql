-- Tabla espejo de respaldo
CREATE TABLE IF NOT EXISTS public.registro_salida_pie_backup (
  id BIGSERIAL PRIMARY KEY,
  alumno_ref TEXT NOT NULL,
  tipo_registro TEXT NOT NULL CHECK (tipo_registro IN ('permanente', 'eventual')),
  dias_semana TEXT[],
  fechas_especificas DATE[],
  cancelaciones_usadas INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  nombre_tutor TEXT NOT NULL,
  email_tutor TEXT NOT NULL,
  telefono_tutor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT max_5_dias_backup CHECK (
    (tipo_registro = 'eventual') OR 
    (tipo_registro = 'permanente' AND array_length(dias_semana, 1) <= 5)
  ),
  CONSTRAINT max_5_cancelaciones_backup CHECK (
    (tipo_registro = 'eventual') OR 
    (tipo_registro = 'permanente' AND cancelaciones_usadas <= 5)
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_registro_salida_pie_backup_alumno_ref 
  ON public.registro_salida_pie_backup(alumno_ref);

CREATE INDEX IF NOT EXISTS idx_registro_salida_pie_backup_activo 
  ON public.registro_salida_pie_backup(activo);

CREATE INDEX IF NOT EXISTS idx_registro_salida_pie_backup_tipo 
  ON public.registro_salida_pie_backup(tipo_registro);

-- Trigger para updated_at
CREATE TRIGGER update_registro_salida_pie_backup_updated_at 
  BEFORE UPDATE ON public.registro_salida_pie_backup 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Permisos completos
GRANT ALL ON TABLE registro_salida_pie_backup TO anon;
GRANT ALL ON TABLE registro_salida_pie_backup TO authenticated;
GRANT ALL ON SEQUENCE registro_salida_pie_backup_id_seq TO anon;
GRANT ALL ON SEQUENCE registro_salida_pie_backup_id_seq TO authenticated;
