-- 1. Tabla Rol
CREATE TABLE rol (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL
);

-- Insertar roles por defecto
INSERT INTO rol (nombre) VALUES ('comensal'), ('voluntario'), ('referente');

-- 2. Tabla Usuario
-- Usamos el mismo ID que auth.users para que coincida con el Auth de Supabase
CREATE TABLE usuario (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  direccion TEXT,
  barrio TEXT,
  rol_id UUID REFERENCES rol(id)
);

-- Habilitar RLS en usuario
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON usuario FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON usuario FOR UPDATE USING (auth.uid() = id);

-- 3. Tabla Comedor
CREATE TABLE comedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  barrio TEXT,
  descripcion TEXT,
  capacidad_estimada INTEGER
);

ALTER TABLE comedor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comedores viewable by everyone" ON comedor FOR SELECT USING (true);
CREATE POLICY "Referentes can insert comedores" ON comedor FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuario u 
    INNER JOIN rol r ON u.rol_id = r.id 
    WHERE u.id = auth.uid() AND r.nombre = 'referente'
  )
);
CREATE POLICY "Referentes can update comedores" ON comedor FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM usuario u 
    INNER JOIN rol r ON u.rol_id = r.id 
    WHERE u.id = auth.uid() AND r.nombre = 'referente'
  )
);

-- 4. Tabla Perfil Referente (vinculada a Usuario y Comedor)
CREATE TABLE perfil_referente (
  usuario_id UUID REFERENCES usuario(id) ON DELETE CASCADE,
  comedor_id UUID REFERENCES comedor(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, comedor_id)
);

-- 5. Tabla Perfil Voluntario
CREATE TABLE perfil_voluntario (
  usuario_id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
  disponibilidad TEXT
);

-- 6. Tabla Habilidad
CREATE TABLE habilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT UNIQUE NOT NULL
);

-- Insertar habilidades por defecto
INSERT INTO habilidad (nombre) VALUES ('Cocina'), ('Limpieza'), ('Lavado'), ('Atención al Público');

-- 7. Tabla RequerimientoComedor (Cupos)
CREATE TABLE requerimiento_comedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comedor_id UUID REFERENCES comedor(id) ON DELETE CASCADE,
  habilidad_id UUID REFERENCES habilidad(id) ON DELETE CASCADE,
  cantidad_necesaria INTEGER NOT NULL DEFAULT 1,
  UNIQUE(comedor_id, habilidad_id)
);

ALTER TABLE requerimiento_comedor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requerimientos viewable by everyone" ON requerimiento_comedor FOR SELECT USING (true);
CREATE POLICY "Referentes can manage requerimientos" ON requerimiento_comedor FOR ALL USING (
  EXISTS (
    SELECT 1 FROM perfil_referente pr WHERE pr.usuario_id = auth.uid() AND pr.comedor_id = requerimiento_comedor.comedor_id
  )
);

-- 8. Tabla Colaboracion (El voluntario se anota a un requerimiento)
CREATE TABLE colaboracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requerimiento_id UUID REFERENCES requerimiento_comedor(id) ON DELETE CASCADE,
  voluntario_id UUID REFERENCES usuario(id) ON DELETE CASCADE,
  estado TEXT DEFAULT 'pendiente', -- pendiente, confirmada, cancelada
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE colaboracion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Colaboraciones viewable by participants" ON colaboracion FOR SELECT USING (
  voluntario_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM requerimiento_comedor req 
    INNER JOIN perfil_referente pr ON req.comedor_id = pr.comedor_id 
    WHERE req.id = colaboracion.requerimiento_id AND pr.usuario_id = auth.uid()
  )
);
CREATE POLICY "Voluntarios can create colaboracion" ON colaboracion FOR INSERT WITH CHECK (voluntario_id = auth.uid());

-- 9. Tabla Notificacion
CREATE TABLE notificacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuario(id) ON DELETE CASCADE, -- destinatario
  mensaje TEXT NOT NULL,
  fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  leida BOOLEAN DEFAULT false
);

ALTER TABLE notificacion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notificacion FOR SELECT USING (usuario_id = auth.uid());

-- Trigger para automatizar usuario cuando se registra en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuario (id, nombre, email, rol_id)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'nombre', 
    new.email,
    (SELECT id FROM rol WHERE nombre = (new.raw_user_meta_data->>'rol'))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
