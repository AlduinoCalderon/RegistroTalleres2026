-- Vaciamos la tabla por si las moscas y reiniciamos los IDs
TRUNCATE TABLE talleres RESTART IDENTITY CASCADE;

INSERT INTO talleres (nombre_tematica, tallerista, dia, capacidad_maxima, requerimientos) VALUES
-- ==========================================
-- JUEVES (22 Talleres | Capacidad: 25)
-- ==========================================
('¿Qué es la cultura?', 'Dra. Marcela Coronado Malagón', 'Jueves', 25, ''), 
('Algunos fundamentos teóricos que orientan la planeación en el aula.', 'Dr. Eliseo Ruiz Aragón', 'Jueves', 25, ''), 
('Una caja de tuercas y tornillos para comprender y explicar fenómenos educativos.', 'Dr. Saúl Vázquez Rodríguez', 'Jueves', 25, 'Participantes: laptop, el nombre de 5 fenómenos educativos (en archivo Word) que hayan observado en su carrera docente, ejemplo: Niños y niñas que abandonan la escuela, alumnos que no saben leer y escribir en grados superiores, brechas de aprendizaje entre alumnos de escuelas matutinas y vespertinas, etc. Lectura del texto (introducción). Se adjunta.'), 
('¿Cómo nos comunicamos en el aula?', 'Dra. Verónica Martínez Santiago', 'Jueves', 25, 'Participantes: hojas de colores 10 por asistente, tarjetas de cartulina de 10x10cms de diferentes colores (10 piezas por asistente), tijeras, regla, pegamento y plumones por asistente.'), 
('Los fundamentos teóricos-metodológicos-pedagógicos y didácticos del PTEO.', 'Mtro. Javier Santiago López Morales', 'Jueves', 25, ''), 
('El docente militante. La batalla cultural en la visión de Antonio Gramsci. Reflexiones en torno a la perspectiva de una educación alternativa.', 'Mtro. Carlos Cruz Ríos', 'Jueves', 25, 'Participantes: cuaderno de notas y 3 hojas blancas.'), 
('Interculturalidad crítica y educación.', 'Mtro. Luis Rey Matadamas', 'Jueves', 25, ''), 
('Análisis, deconstrucción y problematización de la práctica docente.', 'Dr. Isaac Ángeles Contreras', 'Jueves', 25, 'Participante: hojas blancas y lápices.'), 
('Comunalidad.', 'Mtro. Marcial Rodríguez Hernández', 'Jueves', 25, ''), 
('De la práctica al proyecto: herramientas para transformar en el aula.', 'Mtra. Cindy Joselin García Trujillo', 'Jueves', 25, 'Participantes: 1 cartulina por participante, colores/lapicera.'), 
('El PTEO de la teoría a la practicus o praxis.', 'Mtro. Miguel Barragán Bustamante', 'Jueves', 25, ''), 
('Del PTEO al aula: Una aplicación curricular desde el contexto escolar.', 'Mtro. Víctor Manuel Roldan Lorenzo', 'Jueves', 25, 'Participantes: Malla curricular (si tiene la escuela), colores, plumones, resistol, tijeras y 5 hojas blancas.'), 
('Fundamentos teóricos e implicaciones didácticas en el diseño de proyectos.', 'Mtro. Yaotzin Hernández Manzo', 'Jueves', 25, 'Participantes: Lapicera, plumones y colores, 2 hojas de opalina de diferente color y textura, ¼ de papel bond blanco, pegamento blanco.'), 
('La reflexión de mi praxis.', 'Prof. Minerva Robles Ramírez', 'Jueves', 25, 'Participantes: lapicera.'), 
('Protocolos de actuación en el ámbito educativo, administrativo, civil y penal.', 'Mtro. Casiano Luis Mejía', 'Jueves', 25, ''), 
('Entre la teoría y la práctica de los proyectos educativos: telares dialógicos y re-creativos en colectividad.', 'Dr. Ignacio Rogelio Morales Sánchez y Mtro. Miguel Bautista Santiago', 'Jueves', 25, 'Participantes: 10 hojas blancas, tamaño carta, 3 o 4 marcadores de agua de diferentes colores, si tienen Proyecto Educativo llevar al Taller un pliego de papel bond con las siguientes anotaciones: Problemáticas detectadas, en alguna o las tres dimensiones (Administrativa, Pedagógico y Comunitaria), Título del proyecto, Propósito General del Proyecto, Propósitos Específicos del Proyecto, Pregunta guía del Proyecto, un periódico (preferentemente para reusar).'), 
('¿Proyecto educativo o proyecto escolar? Un dialogo colectivo desde nuestro contexto.', 'Mtra. Edilbertha Alberta Ruiz Santiago y Mtra. Zulma Helga Aldeco de la Cruz', 'Jueves', 25, 'Participantes: nombres de sus proyectos, sus propósitos y sus acciones.'), 
('El proyecto escolar, una reconceptualización colectiva.', 'Lic. Jerónimo Martínez Ambrocio', 'Jueves', 25, ''), 
('El discurso educativo en la transformación social.', 'Mtra. Gladis Dalet Sánchez Antonio', 'Jueves', 25, ''), 
('PTEO: Historicidad, enfoque y una oportunidad de hacer propuestas a través del proyecto escolar.', 'Mtra. Maricela Sibaja Cruz y Mtra. Iraís Mencha Gómez', 'Jueves', 25, 'Participantes: 25 hojas blancas (una para cada participante), 25 globos medianos (uno para cada participante).'), 
('Plan de acompañamiento a los proyectos educativos y aproximaciones curriculares de la zona escolar 157: una ruta de trabajo con enfoque crítico dialéctico.', 'Mtra. Zaunay Virginia Rivera López', 'Jueves', 25, ''), 
('Elaboración colectiva del proyecto educativo desde la perspectiva del PTEO.', 'Mtro. Crescenciano Hernández Cuevas', 'Jueves', 25, ''), 

-- ==========================================
-- VIERNES (21 Talleres | Capacidad: 27)
-- ==========================================
('Análisis de la trascendencia de la Pedagogía Crítica y su incursión en el PTEO', 'Mtro. José Francisco García Martínez', 'Viernes', 27, 'Participantes: cuaderno de notas y bolígrafo.'), 
('Pedagogía por proyectos: ¿Cómo llevar el PTEO a las aulas?', 'Mtra. Citlalli Abigail Méndez Altamirano', 'Viernes', 27, 'Participantes: lápiz, goma, 1 cutter, pegamento líquido, regla, lapicero, 10 hojas blancas, 5 de colores, crayolas, marcadores, hojas y flores secas (5 por cada una).'), 
('El enfoque de los lenguajes en los libros de texto de primer grado: continuidades, cambios y rupturas', 'Mtro. Boris Omar Bravo', 'Viernes', 27, ''), 
('El docente militante. La batalla cultural en la visión de Antonio Gramsci. Reflexiones en torno a la perspectiva de una educación alternativa.', 'Mtro. Carlos Cruz Ríos', 'Viernes', 27, 'Participantes: cuaderno de notas y 3 hojas blancas.'), 
('Interculturalidad crítica y educación', 'Mtro. Luis Rey Matadamas', 'Viernes', 27, ''), 
('Análisis, deconstrucción y problematización de la práctica docente.', 'Dr. Isaac Ángeles Contreras', 'Viernes', 27, 'Participante: hojas blancas y lápices.'), 
('El PTEO de la teoría a la practicus o praxis.', 'Mtro. Miguel Barragán Bustamante', 'Viernes', 27, ''), 
('bases teóricas para el fortalecimiento de proyectos educativos.', 'Mtra. Ruby Velez Peña', 'Viernes', 27, 'Participantes: una tarjeta de cartulina blanca de 7.5 x 12.5 cm, un segurito para ropa. Los participantes del taller deben llevar una o más prendas de vestir o accesorios empleados en la vestimenta, para utilizarse en una de las actividades.'), 
('Autoformación Comunitaria: Construcción y trasformación del proyecto escolar PTEO.', 'Mtro. Gabriel García Santiago', 'Viernes', 27, ''), 
('De la práctica al proyecto: herramientas para transformar en el aula.', 'Mtra. Cindy Joselin García Trujillo', 'Viernes', 27, 'Participantes: 1 cartulina por participante, colores/lapicera.'), 
('Del PTEO al aula: Una aplicación curricular desde el contexto escolar.', 'Mtro. Víctor Manuel Roldan Lorenzo', 'Viernes', 27, 'Participantes: malla curricular (si tiene la escuela), colores, plumones, resistol, tijeras y 5 hojas blancas.'), 
('Fundamentos teóricos e implicaciones didácticas en el diseño de proyectos.', 'Mtro. Yaotzin Hernández Manzo', 'Viernes', 27, 'Participantes: Lapicera, plumones y colores, 2 hojas de opalina de diferente color y textura, ¼ de papel bond blanco, pegamento blanco.'), 
('La reflexión de mi praxis.', 'Profa. Minerva Robles Ramírez', 'Viernes', 27, 'Participantes: lapicera.'), 
('Protocolos de actuación en el ámbito educativo, administrativo, civil y penal.', 'Mtro. Casiano Luis Mejía', 'Viernes', 27, ''), 
('¿Proyecto educativo o proyecto escolar? Un dialogo colectivo desde nuestro contexto.', 'Mtra. Edilbertha Alberta Ruiz Santiago y Mtra. Zulma Helga Aldeco de la Cruz', 'Viernes', 27, 'Participantes: nombres de sus proyectos, sus propósitos y sus acciones.'), 
('El proyecto escolar, una reconceptualización colectiva.', 'Lic. Jerónimo Martínez Ambrocio', 'Viernes', 27, ''), 
('El discurso educativo en la transformación social.', 'Mtra. Gladis Dalet Sánchez Antonio', 'Viernes', 27, ''), 
('Entre la teoría y la práctica de los proyectos educativos: telares dialógicos y re-creativos en colectividad.', 'Dr. Ignacio Rogelio Morales Sánchez y Mtro. Miguel Bautista Santiago', 'Viernes', 27, 'Participantes: 10 hojas blancas, tamaño carta, 3 o 4 marcadores de agua de diferentes colores, si tienen Proyecto Educativo llevar al Taller un pliego de papel bond con las siguientes anotaciones: Problemáticas detectadas, en alguna o las tres dimensiones (Administrativa, Pedagógico y Comunitaria), Título del proyecto, Propósito General del Proyecto, Propósitos Específicos del Proyecto, Pregunta guía del Proyecto, un periódico (preferentemente para reusar).'), 
('PTEO: Historicidad, enfoque y una oportunidad de hacer propuestas a través del proyecto escolar.', 'Mtra. Maricela Sibaja Cruz', 'Viernes', 27, 'Participantes: 25 hojas blancas (una para cada participante), 25 globos medianos (uno para cada participante).'), 
('Plan de acompañamiento a los proyectos educativos y aproximaciones curriculares de la zona escolar 157: una ruta de trabajo con enfoque crítico dialéctico.', 'Mtra. Zaunay Virginia Rivera López', 'Viernes', 27, ''), 
('Elaboración colectiva del proyecto educativo desde la perspectiva del PTEO.', 'Mtro. Crescenciano Hernández Cuevas', 'Viernes', 27, '');