-- Datos de prueba para comedores (sin necesidad de referenciar a un usuario todavía)
INSERT INTO comedor (nombre, direccion, barrio, descripcion, capacidad_estimada) VALUES
('Comedor La Esperanza', 'Av. Roca 3241', 'Villa Lugano', 'Brindamos almuerzo a más de 80 familias del barrio. Contamos con espacio cubierto y jardín para los chicos.', 100),
('Olla Popular Belgrano Sur', 'Estación Belgrano Sur', 'Belgrano', 'Olla popular los martes y jueves por la noche.', 50),
('Merendero Arcoíris', 'Calle Falsa 123', 'Floresta', 'Merienda para los chicos del barrio de lunes a sábados.', 30);

-- Bloque anónimo para insertar requerimientos (cupos) vinculados a los comedores recién creados
DO $$
DECLARE
  c1 UUID; c2 UUID;
  h_cocina UUID; h_limpieza UUID; h_atencion UUID;
BEGIN
  -- Obtener IDs de los comedores insertados
  SELECT id INTO c1 FROM comedor WHERE nombre = 'Comedor La Esperanza' LIMIT 1;
  SELECT id INTO c2 FROM comedor WHERE nombre = 'Olla Popular Belgrano Sur' LIMIT 1;
  
  -- Obtener IDs de las habilidades que ya creamos en el esquema anterior
  SELECT id INTO h_cocina FROM habilidad WHERE nombre = 'Cocina' LIMIT 1;
  SELECT id INTO h_limpieza FROM habilidad WHERE nombre = 'Limpieza' LIMIT 1;
  SELECT id INTO h_atencion FROM habilidad WHERE nombre = 'Atención al Público' LIMIT 1;

  -- Insertar requerimientos de voluntarios
  INSERT INTO requerimiento_comedor (comedor_id, habilidad_id, cantidad_necesaria) VALUES
  (c1, h_cocina, 3),
  (c1, h_limpieza, 2),
  (c1, h_atencion, 1),
  (c2, h_cocina, 2),
  (c2, h_limpieza, 1);
END $$;
