-- 1. Tabla: talleres
CREATE TABLE public.talleres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tallerista TEXT NOT NULL,
    nombre_tematica TEXT NOT NULL,
    dia TEXT NOT NULL CHECK (dia IN ('Jueves', 'Viernes')),
    capacidad_maxima INTEGER NOT NULL DEFAULT 25,
    lugares_ocupados INTEGER NOT NULL DEFAULT 0,
    requerimientos TEXT
);

-- 2. Tabla: participantes
CREATE TABLE public.participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_maestro TEXT NOT NULL,
    escuela TEXT NOT NULL,
    cct TEXT NOT NULL,
    telefono VARCHAR(10) UNIQUE NOT NULL CHECK (telefono ~ '^\d{10}$'),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabla: registros
CREATE TABLE public.registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participante_id UUID NOT NULL REFERENCES public.participantes(id) ON DELETE CASCADE,
    taller_id UUID NOT NULL REFERENCES public.talleres(id) ON DELETE CASCADE,
    numero_consecutivo INTEGER NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(participante_id, taller_id)
);

-- Índices de búsqueda
CREATE INDEX idx_talleres_dia ON public.talleres(dia);
CREATE INDEX idx_registros_taller_id ON public.registros(taller_id);
CREATE INDEX idx_participantes_cct ON public.participantes(cct);
CREATE INDEX idx_participantes_telefono ON public.participantes(telefono);

-- 4. Seguridad de Nivel de Fila (RLS)
ALTER TABLE public.talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;

-- El cliente solo puede leer los datos
CREATE POLICY "Public read access on talleres" ON public.talleres FOR SELECT USING (true);
CREATE POLICY "Public read access on participantes" ON public.participantes FOR SELECT USING (true);
CREATE POLICY "Public read access on registros" ON public.registros FOR SELECT USING (true);

-- No permitimos inserts directos desde el cliente en ninguna tabla, todo se hará por RPC
-- Por tanto, no se crean políticas de INSERT/UPDATE para el cliente (quedan denegadas por defecto)

-- 5. Función Atómica RPC: inscribir_maestro
-- SECURITY DEFINER delega a PostgreSQL correr la función con permisos de "admin" (postgres role), evadiendo RLS para la escritura.
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

    -- Extraer los datos y bloquearlos en transaccion para evitar que se llenen (Concurrency Control)
    SELECT * INTO v_taller_jueves FROM public.talleres WHERE id = p_taller_jueves_id FOR UPDATE;
    SELECT * INTO v_taller_viernes FROM public.talleres WHERE id = p_taller_viernes_id FOR UPDATE;
    
    IF v_taller_jueves.dia != 'Jueves' OR v_taller_viernes.dia != 'Viernes' THEN
        RAISE EXCEPTION 'Fechas seleccionadas no coinciden con los días esperados.';
    END IF;

    -- Validar que no sea la misma temática ambos días (ignorando mayúsculas, signos de puntuación y espacios)
    IF regexp_replace(lower(v_taller_jueves.nombre_tematica), '[^a-záéíóúüñ0-9]', '', 'g') = 
       regexp_replace(lower(v_taller_viernes.nombre_tematica), '[^a-záéíóúüñ0-9]', '', 'g') THEN
        RAISE EXCEPTION 'No se puede seleccionar la misma temática para ambos días. Debe seleccionar un taller diferente para cada uno de los 2 días.';
    END IF;

    IF v_taller_jueves.lugares_ocupados >= v_taller_jueves.capacidad_maxima THEN
        RAISE EXCEPTION 'El taller del jueves ya no tiene cupo.';
    END IF;

    IF v_taller_viernes.lugares_ocupados >= v_taller_viernes.capacidad_maxima THEN
        RAISE EXCEPTION 'El taller del viernes ya no tiene cupo.';
    END IF;

    -- 1. Insertar Participante con el nuevo campo telefono
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
        'requerimientos_jueves', v_taller_jueves.requerimientos,
        'tallerista_viernes', v_taller_viernes.tallerista,
        'tematica_viernes', v_taller_viernes.nombre_tematica,
        'requerimientos_viernes', v_taller_viernes.requerimientos
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al procesar inscripción: %', SQLERRM;
END;
$$;
