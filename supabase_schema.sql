-- 1. Tabla: talleres
CREATE TABLE public.talleres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_tematica TEXT NOT NULL,
    dia TEXT NOT NULL CHECK (dia IN ('Jueves', 'Viernes')),
    capacidad_maxima INTEGER NOT NULL DEFAULT 25,
    lugares_ocupados INTEGER NOT NULL DEFAULT 0
);

-- 2. Tabla: participantes
CREATE TABLE public.participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_maestro TEXT NOT NULL,
    escuela TEXT NOT NULL,
    cct TEXT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabla: registros
CREATE TABLE public.registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participante_id UUID NOT NULL REFERENCES public.participantes(id) ON DELETE CASCADE,
    taller_id UUID NOT NULL REFERENCES public.talleres(id) ON DELETE CASCADE,
    numero_consecutivo INTEGER NOT NULL CHECK (numero_consecutivo BETWEEN 1 AND 25),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(participante_id, taller_id)
);

-- Índices de búsqueda
CREATE INDEX idx_talleres_dia ON public.talleres(dia);
CREATE INDEX idx_registros_taller_id ON public.registros(taller_id);
CREATE INDEX idx_participantes_cct ON public.participantes(cct);

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
    p_taller_jueves_id UUID DEFAULT NULL,
    p_taller_viernes_id UUID DEFAULT NULL
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
    -- Validar que al menos haya elegido un taller
    IF p_taller_jueves_id IS NULL AND p_taller_viernes_id IS NULL THEN
        RAISE EXCEPTION 'Debe seleccionar al menos un taller.';
    END IF;

    -- Validar que los talleres no sean en el mismo día por error de frontend y que no sean de la misma temática
    IF p_taller_jueves_id IS NOT NULL AND p_taller_viernes_id IS NOT NULL THEN
        -- Extraer los datos y bloquearlos en transaccion para evitar que se llenen
        SELECT * INTO v_taller_jueves FROM public.talleres WHERE id = p_taller_jueves_id FOR UPDATE;
        SELECT * INTO v_taller_viernes FROM public.talleres WHERE id = p_taller_viernes_id FOR UPDATE;
        
        IF v_taller_jueves.dia != 'Jueves' OR v_taller_viernes.dia != 'Viernes' THEN
            RAISE EXCEPTION 'Fechas seleccionadas no coinciden.';
        END IF;

        IF v_taller_jueves.nombre_tematica = v_taller_viernes.nombre_tematica THEN
            RAISE EXCEPTION 'No se puede seleccionar la misma temática para ambos días.';
        END IF;

        IF v_taller_jueves.lugares_ocupados >= v_taller_jueves.capacidad_maxima THEN
            RAISE EXCEPTION 'El taller del jueves ya no tiene cupo.';
        END IF;

        IF v_taller_viernes.lugares_ocupados >= v_taller_viernes.capacidad_maxima THEN
            RAISE EXCEPTION 'El taller del viernes ya no tiene cupo.';
        END IF;

    ELSEIF p_taller_jueves_id IS NOT NULL THEN
        SELECT * INTO v_taller_jueves FROM public.talleres WHERE id = p_taller_jueves_id FOR UPDATE;
        IF v_taller_jueves.dia != 'Jueves' THEN
            RAISE EXCEPTION 'Taller seleccionado no es del Jueves.';
        END IF;
        IF v_taller_jueves.lugares_ocupados >= v_taller_jueves.capacidad_maxima THEN
            RAISE EXCEPTION 'El taller del jueves ya no tiene cupo.';
        END IF;
    ELSEIF p_taller_viernes_id IS NOT NULL THEN
        SELECT * INTO v_taller_viernes FROM public.talleres WHERE id = p_taller_viernes_id FOR UPDATE;
        IF v_taller_viernes.dia != 'Viernes' THEN
            RAISE EXCEPTION 'Taller seleccionado no es del Viernes.';
        END IF;
        IF v_taller_viernes.lugares_ocupados >= v_taller_viernes.capacidad_maxima THEN
            RAISE EXCEPTION 'El taller del viernes ya no tiene cupo.';
        END IF;
    END IF;

    -- 1. Insertar Participante
    INSERT INTO public.participantes (nombre_maestro, escuela, cct)
    VALUES (p_nombre_maestro, p_escuela, p_cct)
    RETURNING id INTO v_participante_id;

    -- 2. Procesar Jueves
    IF p_taller_jueves_id IS NOT NULL THEN
        v_consecutivo_jueves := v_taller_jueves.lugares_ocupados + 1;
        
        INSERT INTO public.registros (participante_id, taller_id, numero_consecutivo)
        VALUES (v_participante_id, p_taller_jueves_id, v_consecutivo_jueves);
        
        UPDATE public.talleres 
        SET lugares_ocupados = v_consecutivo_jueves 
        WHERE id = p_taller_jueves_id;
    END IF;

    -- 3. Procesar Viernes
    IF p_taller_viernes_id IS NOT NULL THEN
        v_consecutivo_viernes := v_taller_viernes.lugares_ocupados + 1;
        
        INSERT INTO public.registros (participante_id, taller_id, numero_consecutivo)
        VALUES (v_participante_id, p_taller_viernes_id, v_consecutivo_viernes);
        
        UPDATE public.talleres 
        SET lugares_ocupados = v_consecutivo_viernes 
        WHERE id = p_taller_viernes_id;
    END IF;

    -- Si todo fue bien, retornamos éxito
    RETURN jsonb_build_object(
        'success', true,
        'participante_id', v_participante_id,
        'jueves_consecutivo', v_consecutivo_jueves,
        'viernes_consecutivo', v_consecutivo_viernes
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al procesar inscripción: %', SQLERRM;
END;
$$;
