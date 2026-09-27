import re

with open('src/pages/EditarComedor.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# The current code:
#        let latitud: number | undefined;
#        let longitud: number | undefined;
#        if (geoData && geoData.length > 0) {
#          latitud = parseFloat(geoData[0].lat);
#          longitud = parseFloat(geoData[0].lon);
#        }

replacement = """        let latitud: number | undefined;
        let longitud: number | undefined;
        if (!geoData || geoData.length === 0) {
          throw new Error('No pudimos encontrar la ubicación en el mapa. Por favor, verificá que la dirección y el barrio sean correctos.');
        }
        latitud = parseFloat(geoData[0].lat);
        longitud = parseFloat(geoData[0].lon);"""

# Use a generic regex to replace that block
pattern = r'let latitud: number \| undefined;\s*let longitud: number \| undefined;\s*if \(geoData && geoData\.length > 0\) \{\s*latitud = parseFloat\(geoData\[0\]\.lat\);\s*longitud = parseFloat\(geoData\[0\]\.lon\);\s*\}'

text = re.sub(pattern, replacement, text)

# Insert the number check before Nominatim in EditarComedor (I did it already but let's make sure it's there)
# Actually my previous replace did it for both because it looped over `filepath`? No, it only updated `GestionComedor`. I'll update it for EditarComedor too.
if '!/\\d/.test(direccion)' not in text:
    text = text.replace("const queryGeocoding", """      // Validar que la dirección tenga al menos un número (la altura)
      if (!/\\d/.test(direccion)) {
        throw new Error('La dirección debe incluir la altura (un número válido).');
      }
      const queryGeocoding""")


with open('src/pages/EditarComedor.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
