import re

with open('src/pages/GestionComedor.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# Eliminar las declaraciones duplicadas de normalize y displayName de la vieja validacion
old_extra = """      // Validación estricta del barrio
      const displayName = geoData[0].display_name || '';
      const normalize = (str: string) => str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
      
      // Chequear si el barrio ingresado está en el resultado del mapa
      if (!normalize(displayName).includes(normalize(barrio))) {
        throw new Error(`El mapa ubicó esta dirección en: "${displayName}". Verificá que el barrio ingresado coincida con la ubicación real.`);
      }"""

text = text.replace(old_extra, '')

with open('src/pages/GestionComedor.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))

print("Duplicados eliminados.")
