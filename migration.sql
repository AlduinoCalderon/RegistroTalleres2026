-- Activar extensión pg_stat_statements si fuera necesario o asegurarla
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Añadir columna tallerista a talleres
ALTER TABLE public.talleres ADD COLUMN IF NOT EXISTS tallerista TEXT;
UPDATE public.talleres SET tallerista = 'Por asignar' WHERE tallerista IS NULL;
ALTER TABLE public.talleres ALTER COLUMN tallerista SET NOT NULL;

-- 2. Añadir columna telefono a participantes
ALTER TABLE public.participantes ADD COLUMN IF NOT EXISTS telefono VARCHAR(10);
UPDATE public.participantes SET telefono = LPAD(floor(random() * 10000000000)::text, 10, '0') WHERE telefono IS NULL; -- Mock data to avoid constraint fails for existing
ALTER TABLE public.participantes ADD CONSTRAINT participantes_telefono_key UNIQUE (telefono);
ALTER TABLE public.participantes ADD CONSTRAINT participantes_telefono_check CHECK (telefono ~ '^\d{10}$');
ALTER TABLE public.participantes ALTER COLUMN telefono SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_participantes_telefono ON public.participantes(telefono);

-- 3. Actualizar la Función Atómica RPC: inscribir_maestro
CREATE OR REPLACE FUNCTION public.inscribir_maestro(
    p_nombre_maestro TEXT,
    p_escuela TEXT,
    p_cct TEXT,
    p_telefono TEXT,
    p_taller_jueves_id UUID,
    p_taller_viernes_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_participante_id UUID;
    v_taller_jueves RECORD;
    v_taller_viernes RECORD;
    v_consecutivo_jueves INTEGER;
    v_consecutivo_viernes INTEGER;
BEGIN
    -- Validar formato del teléfono (10 dígitos exactos numéricos)
    IF p_telefono !~ '^\d{10}$' THEN
        RAISE EXCEPTION 'El teléfono debe tener exactamente 10 dígitos numéricos.';
    END IF;

    -- Validar que haya elegido ambos talleres OBLIGATORIAMENTE
    IF p_taller_jueves_id IS NULL OR p_taller_viernes_id IS NULL THEN
        RAISE EXCEPTION 'Debe seleccionar un taller diferente para cada uno de los 2 días.';
    END IF;

    -- Validar que el teléfono no exista ya
    IF EXISTS (SELECT 1 FROM public.participantes WHERE telefono = p_telefono) THEN
        RAISE EXCEPTION 'Este número de teléfono ya está registrado con otro participante. Solo se permite un registro por persona.';
    END IF;

    -- Extraer los datos y bloquearlos en transaccion para evitar que se llenen
    SELECT * INTO v_taller_jueves FROM public.talleres WHERE id = p_taller_jueves_id FOR UPDATE;
    SELECT * INTO v_taller_viernes FROM public.talleres WHERE id = p_taller_viernes_id FOR UPDATE;
    
    IF v_taller_jueves.dia != 'Jueves' OR v_taller_viernes.dia != 'Viernes' THEN
        RAISE EXCEPTION 'Fechas seleccionadas no coinciden con los días esperados.';
    END IF;

    -- Validar que no sea la misma temática ambos días
    IF v_taller_jueves.nombre_tematica = v_taller_viernes.nombre_tematica THEN
        RAISE EXCEPTION 'No se puede seleccionar la misma temática para ambos días. Debe seleccionar un taller diferente para cada uno de los 2 días.';
    END IF;

    IF v_taller_jueves.lugares_ocupados >= v_taller_jueves.capacidad_maxima THEN
        RAISE EXCEPTION 'El taller del jueves ya no tiene cupo.';
    END IF;

    IF v_taller_viernes.lugares_ocupados >= v_taller_viernes.capacidad_maxima THEN
        RAISE EXCEPTION 'El taller del viernes ya no tiene cupo.';
    END IF;

    -- 1. Insertar Participante
    INSERT INTO public.participantes (nombre_maestro, escuela, cct, telefono)
    VALUES (p_nombre_maestro, p_escuela, p_cct, p_telefono)
    RETURNING id INTO v_participante_id;

    -- 2. Procesar Jueves
    v_consecutivo_jueves := v_taller_jueves.lugares_ocupados + 1;
    
    INSERT INTO public.registros (participante_id, taller_id, numero_consecutivo)
    VALUES (v_participante_id, p_taller_jueves_id, v_consecutivo_jueves);
    
    UPDATE public.talleres 
    SET lugares_ocupados = v_consecutivo_jueves 
    WHERE id = p_taller_jueves_id;

    -- 3. Procesar Viernes
    v_consecutivo_viernes := v_taller_viernes.lugares_ocupados + 1;
    
    INSERT INTO public.registros (participante_id, taller_id, numero_consecutivo)
    VALUES (v_participante_id, p_taller_viernes_id, v_consecutivo_viernes);
    
    UPDATE public.talleres 
    SET lugares_ocupados = v_consecutivo_viernes 
    WHERE id = p_taller_viernes_id;

    -- Si todo fue bien, retornamos éxito
    RETURN jsonb_build_object(
        'success', true,
        'participante_id', v_participante_id,
        'jueves_consecutivo', v_consecutivo_jueves,
        'viernes_consecutivo', v_consecutivo_viernes,
        'tallerista_jueves', v_taller_jueves.tallerista,
        'tematica_jueves', v_taller_jueves.nombre_tematica,
        'tallerista_viernes', v_taller_viernes.tallerista,
        'tematica_viernes', v_taller_viernes.nombre_tematica
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al procesar inscripción: %', SQLERRM;
END;
$$;
