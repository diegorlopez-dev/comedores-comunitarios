-- Agregar columna de estado a los requerimientos
ALTER TABLE requerimiento_comedor 
ADD COLUMN cupo_lleno BOOLEAN DEFAULT false;

-- Permitir que el referente del comedor pueda modificar sus propios requerimientos
CREATE POLICY "Referentes_update_sus_requerimientos" 
ON requerimiento_comedor FOR UPDATE 
USING (
  comedor_id IN (
    SELECT id FROM comedor WHERE usuario_id = auth.uid()
  )
);
