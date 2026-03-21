-- Insertar talleres para Jueves y Viernes

WITH talleres_data (tallerista, nombre_tematica) AS (
    VALUES
    ('Dr. Saúl Vázquez Rodríguez', 'Una caja de tuercas y tornillos para comprender y explicar fenómenos educativos'),
    ('Mtro. Miguel Barragán Bustamante', 'El PTEO de la teoría a la practicus o praxis'),
    ('Mtro. Víctor Manuel Roldan Lorenzo', 'Del PTEO al aula: Una aplicación curricular desde el contexto escolar'),
    ('Mtro. Casiano Luis Mejía', 'Protocolos de actuación en el ámbito educativo, administrativo, civil y penal'),
    ('Mtra. Edilbertha Alberta Ruiz Santiago', '¿Proyecto educativo o proyecto escolar? Un dialogo colectivo desde nuestro contexto'),
    ('Lic. Jerónimo Martínez Ambrocio', 'El proyecto escolar, una reconceptualización colectiva'),
    ('Mtra. Gladis Dalet Sánchez Antonio', 'El discurso educativo en la transformación social'),
    ('Mtra. Maricela Sibaja Cruz', 'PTEO: Historicidad, enfoque y una oportunidad de hacer propuestas a través del proyecto escolar'),
    ('Mtra. Zaunay Virginia Rivera López', 'Plan de acompañamiento a los proyectos educativos...'),
    ('Mtro. Gabriel García Santiago', 'Autoformación Comunitaria: Construcción y trasformación del proyecto escolar PTEO'),
    ('Mtro. Luis Rey Matadamas', 'Interculturalidad crítica y educación'),
    ('Dr. Isaac Ángeles Contreras', 'Análisis, deconstrucción y problematización de la práctica docente'),
    ('Mtro. Carlos Cruz Ríos', 'El docente militante. La batalla cultural en la visión de Antonio Gramsci...'),
    ('Mtro. José Francisco García Martínez', 'Análisis de la trascendencia de la Pedagogía Crítica y su incursión en el PTEO'),
    ('Mtro. Marcial Rodríguez Hernández', 'Comunalidad'),
    ('Dra. Marcela Coronado Malagón', '¿Qué es la cultura?'),
    ('Dr. Eliseo Ruiz Aragón', 'Algunos fundamentos teóricos que orientan la planeación en el aula'),
    ('Dra. Verónica Martínez Santiago', '¿Cómo nos comunicamos en el aula?'),
    ('Mtro. Boris Omar Bravo', 'El enfoque de los lenguajes en los libros de texto de primer grado...'),
    ('Mtra. Cindy Joselyn García Trujillo', 'De la práctica al proyecto: herramientas para transformar en el aula'),
    ('Mtro. Crecenciano Hernández Cuevas', 'Elaboración colectiva del proyecto educativo desde la perspectiva del PTEO'),
    
    -- Talleres "PENDIENTES"
    ('Mtro. Javier S. López Morales', 'PENDIENTE'),
    ('Mtro. Yaotzin Hernández Manzo', 'PENDIENTE'),
    ('Profa. Minerva Robles Ramírez', 'PENDIENTE'),
    ('Dr. Ignacio Rogelio Morales Sánchez y Miguel Bautista Santiago', 'PENDIENTE'),
    ('Mtra. Citlalli Abigail Méndez Altamirano', 'PENDIENTE'),
    ('Mtra. Ruby Velez Peña', 'PENDIENTE')
)
INSERT INTO public.talleres (tallerista, nombre_tematica, dia, capacidad_maxima)
SELECT 
    t.tallerista, 
    t.nombre_tematica, 
    d.dia, 
    25
FROM talleres_data t 
CROSS JOIN (VALUES ('Jueves'), ('Viernes')) AS d(dia);
