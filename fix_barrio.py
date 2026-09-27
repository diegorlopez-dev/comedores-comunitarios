import re

def add_strict_validation(filepath):
    with open(filepath, 'rb') as f:
        text = f.read().decode('utf-8')

    validation_code = """      const latitud = parseFloat(geoData[0].lat);
      const longitud = parseFloat(geoData[0].lon);

      // Validación estricta del barrio
      const displayName = geoData[0].display_name || '';
      const normalize = (str: string) => str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
      
      // Chequear si el barrio ingresado está en el resultado del mapa
      if (!normalize(displayName).includes(normalize(barrio))) {
        throw new Error(`El mapa ubicó esta dirección en: "${displayName}". Verificá que el barrio ingresado coincida con la ubicación real.`);
      }"""

    # En GestionComedor
    if 'GestionComedor' in filepath:
        text = text.replace("""      const latitud = parseFloat(geoData[0].lat);
      const longitud = parseFloat(geoData[0].lon);""", validation_code)
    else:
        # En EditarComedor
        validation_code_edit = """        latitud = parseFloat(geoData[0].lat);
        longitud = parseFloat(geoData[0].lon);
        
        // Validación estricta del barrio
        const displayName = geoData[0].display_name || '';
        const normalize = (str: string) => str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
        
        if (!normalize(displayName).includes(normalize(barrio))) {
          throw new Error(`El mapa ubicó esta dirección en: "${displayName}". Verificá que el barrio ingresado coincida con la ubicación real.`);
        }"""
        text = text.replace("""        latitud = parseFloat(geoData[0].lat);
        longitud = parseFloat(geoData[0].lon);""", validation_code_edit)

    with open(filepath, 'wb') as f:
        f.write(text.encode('utf-8'))

add_strict_validation('src/pages/GestionComedor.tsx')
add_strict_validation('src/pages/EditarComedor.tsx')
print("Validación estricta agregada.")
