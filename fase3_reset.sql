-- Fase 3: Script de "Reset" para Lanzamiento a Producción (Go-Live)
-- Este script elimina toda la data de prueba de las tablas: registros, participantes, y talleres.
-- Además, reinicia las secuencias/IDs para asegurar que los nuevos datos arranquen desde el ID inicial (consecutivos = 1, etc).

BEGIN;

-- TRUNCATE limpia completamente las tablas de forma muy eficiente.
-- RESTART IDENTITY asegura que cualquier contador autoincremental vuelva a 1 (si hubiese alguna columna SERIAL).
-- CASCADE elimina los datos en tablas dependientes, aunque aquí lo hacemos explícitamente.
TRUNCATE TABLE public.registros, public.participantes, public.talleres RESTART IDENTITY CASCADE;

COMMIT;

-- Nota: En este punto, la base de datos está vacía de información, pero mantiene su estructura (tablas, funciones y columnas como "requerimientos").
-- Puedes proceder a correr el script de inserción (Seed) definitivo.
