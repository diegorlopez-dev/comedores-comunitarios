import re

def update_file(filepath):
    with open(filepath, 'rb') as f:
        text = f.read().decode('utf-8')
    
    # 1. Encontrar donde se llama a Nominatim
    # y justo antes insertar la validación del número en la dirección
    
    validation_code = """
      // Validar que la dirección tenga al menos un número (la altura)
      if (!/\\d/.test(direccion)) {
        throw new Error('La dirección debe incluir la altura (un número válido).');
      }
      
      const queryGeocoding"""

    # Reemplazar la línea de const queryGeocoding con la validación antes
    text = text.replace("const queryGeocoding", validation_code.strip())

    with open(filepath, 'wb') as f:
        f.write(text.encode('utf-8'))

update_file('src/pages/GestionComedor.tsx')

# Para EditarComedor, además queremos que lance error si Nominatim falla
with open('src/pages/EditarComedor.tsx', 'rb') as f:
    edit_text = f.read().decode('utf-8')

# Arreglar lógica para que falle si no lo encuentra, como en GestionComedor
edit_bad_logic = """if (geoData && geoData.length > 0) {
          latitud = parseFloat(geoData[0].lat);
          longitud = parseFloat(geoData[0].lon);
        }"""

edit_good_logic = """if (!geoData || geoData.length === 0) {
          throw new Error('No pudimos encontrar la ubicación en el mapa. Por favor, verificá que la dirección y el barrio sean correctos.');
        }
        let latitud = parseFloat(geoData[0].lat);
        let longitud = parseFloat(geoData[0].lon);"""

edit_text = edit_text.replace(edit_bad_logic, edit_good_logic)
# Y sacar let latitud; let longitud; para evitar duplicados, si es necesario.
# Mejor lo hacemos con regex exacto

with open('src/pages/EditarComedor.tsx', 'wb') as f:
    f.write(edit_text.encode('utf-8'))
