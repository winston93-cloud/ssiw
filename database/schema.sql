-- Tabla para registro de salidas a pie
CREATE TABLE IF NOT EXISTS public.registro_salida (
  id BIGSERIAL PRIMARY KEY,
  alumno_ref TEXT NOT NULL REFERENCES public.alumno(alumno_ref),
  fecha DATE NOT NULL,
  nombre_tutor TEXT NOT NULL,
  email_tutor TEXT NOT NULL,
  telefono_tutor TEXT NOT NULL,
  token_confirmacion TEXT UNIQUE NOT NULL,
  token_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmado BOOLEAN DEFAULT FALSE,
  fecha_confirmacion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_registro_salida_alumno_ref 
  ON public.registro_salida(alumno_ref);

CREATE INDEX IF NOT EXISTS idx_registro_salida_fecha 
  ON public.registro_salida(fecha);

CREATE INDEX IF NOT EXISTS idx_registro_salida_token 
  ON public.registro_salida(token_confirmacion);

CREATE INDEX IF NOT EXISTS idx_registro_salida_confirmado 
  ON public.registro_salida(confirmado);

-- Constraint para evitar registros duplicados confirmados
CREATE UNIQUE INDEX IF NOT EXISTS idx_registro_salida_unico 
  ON public.registro_salida(alumno_ref, fecha) 
  WHERE confirmado = TRUE;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_registro_salida_updated_at ON public.registro_salida;
CREATE TRIGGER update_registro_salida_updated_at 
  BEFORE UPDATE ON public.registro_salida 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE public.registro_salida IS 'Registro de salidas a pie de alumnos';
COMMENT ON COLUMN public.registro_salida.alumno_ref IS 'Referencia al número de control del alumno';
COMMENT ON COLUMN public.registro_salida.fecha IS 'Fecha para la salida a pie';
COMMENT ON COLUMN public.registro_salida.nombre_tutor IS 'Nombre completo del padre/tutor que recogerá';
COMMENT ON COLUMN public.registro_salida.email_tutor IS 'Email del tutor para confirmación';
COMMENT ON COLUMN public.registro_salida.telefono_tutor IS 'Teléfono de contacto del tutor';
COMMENT ON COLUMN public.registro_salida.token_confirmacion IS 'Token único para confirmar el registro';
COMMENT ON COLUMN public.registro_salida.token_expiracion IS 'Fecha y hora de expiración del token';
COMMENT ON COLUMN public.registro_salida.confirmado IS 'Si el registro ha sido confirmado por email';
COMMENT ON COLUMN public.registro_salida.fecha_confirmacion IS 'Fecha y hora en que se confirmó el registro';
