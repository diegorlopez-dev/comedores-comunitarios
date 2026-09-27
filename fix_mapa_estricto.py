import re

def update_file(filepath):
    with open(filepath, 'rb') as f:
        text = f.read().decode('utf-8')

    # Mejorar la validación de dirección en ambos archivos
    old_val = """      // Validar que Nominatim haya encontrado una CALLE (no una estación, plaza, etc.)
      const addr = geoData[0].address || {};
      if (!addr.road) {
        throw new Error('La dirección ingresada no corresponde a una calle válida en Capital Federal. Usá el formato "Calle Altura" (ej: Av. Rivadavia 1234).');
      }"""
      
    new_val = """      // Validar estrictamente que sea una dirección de calle o edificio y no una estación/parque
      const addr = geoData[0].address || {};
      const clase = geoData[0].class;
      const validClasses = ['highway', 'place', 'building'];
      
      if (!validClasses.includes(clase) || !addr.road) {
        throw new Error('Esta dirección no fue reconocida como una calle válida (el mapa detectó una estación, parque o lugar inválido). Asegurate de poner el nombre exacto de la calle y su altura.');
      }"""

    # En caso de EditarComedor, las variables no tienen `const` en la primera línea en mi reemplazo anterior, revisemos.
    # Mejor usar Regex.
    
    pattern_val = r'// Validar que Nominatim haya encontrado una CALLE.*?\n.*?(?:const\s+)?addr\s*=\s*geoData\[0\]\.address.*?;\n\s*if\s*\(\!addr\.road\)\s*\{.*?\n.*?\}'
    
    text = re.sub(pattern_val, new_val, text, flags=re.DOTALL)

    # Si es EditarComedor, sacar el campo barrio
    if 'EditarComedor' in filepath:
        # 1. Sacar estado
        text = re.sub(r'\s*const \[barrio, setBarrio\] = useState\(\'\'\);\n', '\n', text)
        
        # 2. Reemplazar validación estricta de barrio por extracción
        old_barrio_check = r'// Validar que el barrio ingresado coincida.*?throw new Error\(`El mapa ubicó.*?\}'
        
        new_barrio_extract = """// Extraer barrio automáticamente
        const barrioDetectado = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || 'Capital Federal';"""
        text = re.sub(old_barrio_check, new_barrio_extract, text, flags=re.DOTALL)
        
        # 3. Poner el barrioDetectado en el payload
        text = text.replace("barrio,\n          direccion,", "barrio: barrioDetectado,\n          direccion,")
        
        # 4. Sacar input barrio del JSX
        text = re.sub(r'\s*<div>\s*<label[^>]*>Barrio \*</label>\s*<input[^>]*value=\{barrio\}[^>]*/>\s*</div>', '', text, flags=re.DOTALL)

    with open(filepath, 'wb') as f:
        f.write(text.encode('utf-8'))
        
update_file('src/pages/GestionComedor.tsx')
update_file('src/pages/EditarComedor.tsx')

print("Fixes aplicados")
