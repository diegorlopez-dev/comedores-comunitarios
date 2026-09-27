with open('src/pages/EditarComedor.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# Remove barrio state
import re
text = re.sub(r'\s*const \[barrio, setBarrio\] = useState\(\'\'\);\n', '\n', text)

# Extract barrioDetectado
old_logic = """        // Validar que el barrio ingresado coincida con el resultado del mapa
        const normalize = (s: string) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
        const displayName = geoData[0].display_name || '';
        if (!normalize(displayName).includes(normalize(barrio))) {
          throw new Error(`El mapa ubicó esta dirección en: "${displayName.split(',').slice(0,3).join(',')}, ...". Verificá que el barrio sea correcto.`);
        }"""
        
new_logic = """        // Extraer barrio automáticamente
        const barrioDetectado = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || 'Capital Federal';"""

text = text.replace(old_logic, new_logic)

# Replace payload barrio
text = text.replace("          barrio,\n          direccion,", "          barrio: barrioDetectado,\n          direccion,")

# Remove barrio input
text = re.sub(r'\s*<div>\s*<label[^>]*>Barrio \*</label>.*?</div>', '', text, flags=re.DOTALL)

with open('src/pages/EditarComedor.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))

# Now for the validation (applied to both)
for filepath in ['src/pages/GestionComedor.tsx', 'src/pages/EditarComedor.tsx']:
    with open(filepath, 'rb') as f:
        content = f.read().decode('utf-8')
    
    old_val = """// Validar que Nominatim haya encontrado una CALLE (no una estación, plaza, etc.)
      const addr = geoData[0].address || {};
      if (!addr.road) {"""
    old_val2 = """// Validar que Nominatim haya encontrado una CALLE (no una estación, plaza, etc.)
        const addr = geoData[0].address || {};
        if (!addr.road) {"""
        
    new_val = """// Validar estrictamente que sea una dirección de calle o edificio y no una estación/parque
      const addr = geoData[0].address || {};
      const clase = geoData[0].class;
      const validClasses = ['highway', 'place', 'building'];
      
      if (!validClasses.includes(clase) || !addr.road) {"""
      
    new_val2 = """// Validar estrictamente que sea una dirección de calle o edificio y no una estación/parque
        const addr = geoData[0].address || {};
        const clase = geoData[0].class;
        const validClasses = ['highway', 'place', 'building'];
        
        if (!validClasses.includes(clase) || !addr.road) {"""
        
    content = content.replace(old_val, new_val).replace(old_val2, new_val2)
    with open(filepath, 'wb') as f:
        f.write(content.encode('utf-8'))
