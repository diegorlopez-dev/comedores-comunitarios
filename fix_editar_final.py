import re

with open('src/pages/EditarComedor.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# Remove barrio state and setBarrio logic
text = re.sub(r'\s*const \[barrio, setBarrio\] = useState\(\'\'\);\n', '\n', text)
text = re.sub(r'\s*setBarrio\(data\.barrio \|\| \'\'\);\n', '\n', text)

# Replace the Nominatim fetch and validation
old_fetch = r'const queryGeocoding = encodeURIComponent\(`\$\{direccion\}, \$\{barrio\}, Argentina`\);\n\s*const geoResponse = await fetch\(`https://nominatim.openstreetmap.org/search\?format=json&q=\$\{queryGeocoding\}`\);\n\s*const geoData = await geoResponse\.json\(\);\n\s*let latitud: number \| undefined;\n\s*let longitud: number \| undefined;\n\s*if \(\!geoData \|\| geoData\.length === 0\) \{\n\s*throw new Error\(\'No pudimos encontrar la ubicación en el mapa. Por favor, verificá que la dirección y el barrio sean correctos\.\'\);\n\s*\}\n\s*latitud = parseFloat\(geoData\[0\]\.lat\);\n\s*longitud = parseFloat\(geoData\[0\]\.lon\);\n\s*// Validación estricta del barrio\n\s*const displayName = geoData\[0\]\.display_name \|\| \'\';\n\s*const normalize = \(str: string\) => str\.normalize\("NFD"\)\.replace\(/\[\\u0300-\\u036f\]/g, ""\)\.toLowerCase\(\);\n\s*if \(\!normalize\(displayName\)\.includes\(normalize\(barrio\)\)\) \{\n\s*throw new Error\(`El mapa ubicó esta dirección en: "\$\{displayName\}"\. Verificá que el barrio ingresado coincida con la ubicación real\.`\);\n\s*\}'

new_fetch = """// Buscar solo en CABA con addressdetails
      const queryGeocoding = encodeURIComponent(`${direccion}, Ciudad Autónoma de Buenos Aires, Argentina`);
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ar&q=${queryGeocoding}&viewbox=-58.5312,-34.7052,-58.3341,-34.5272&bounded=1`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        throw new Error('No pudimos encontrar esta dirección en Capital Federal. Verificá que la calle y altura sean correctas.');
      }

      // Validar estrictamente que sea una dirección de calle o edificio y no una estación/parque
      const addr = geoData[0].address || {};
      const clase = geoData[0].class;
      const validClasses = ['highway', 'place', 'building'];
      
      if (!validClasses.includes(clase) || !addr.road) {
        throw new Error('Esta dirección no fue reconocida como una calle válida (el mapa detectó una estación, parque o lugar inválido). Asegurate de poner el nombre exacto de la calle y su altura.');
      }

      // Extraer barrio automáticamente
      const barrioDetectado = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || 'Capital Federal';
      let latitud = parseFloat(geoData[0].lat);
      let longitud = parseFloat(geoData[0].lon);"""

text = re.sub(old_fetch, new_fetch, text, flags=re.DOTALL)

# Replace payload barrio
text = text.replace("barrio,\n        direccion,", "barrio: barrioDetectado,\n        direccion,")

# Remove barrio input
text = re.sub(r'\s*<div>\s*<label[^>]*>Barrio.*?</label>\s*<input[^>]*value=\{barrio\}[^>]*/>\s*</div>', '', text, flags=re.DOTALL)

with open('src/pages/EditarComedor.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
