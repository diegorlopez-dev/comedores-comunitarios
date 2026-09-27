import re

def rewrite_geocoding(filepath):
    with open(filepath, 'rb') as f:
        text = f.read().decode('utf-8')

    old_logic_pattern = r'// Buscar solo en CABA con addressdetails.*?const direccionOficial = `\$\{addr\.road\} \$\{addr\.house_number \|\| numeroIngresado\}`\.trim\(\);\s*'
    
    new_logic = """// Validar y Geocodificar usando la API oficial del Gobierno de la Ciudad (USIG)
      const usigUrl = `https://servicios.usig.buenosaires.gob.ar/normalizar/?direccion=${encodeURIComponent(direccion)}&geocodificar=true`;
      const usigResponse = await fetch(usigUrl);
      const usigData = await usigResponse.json();

      if (!usigData.direccionesNormalizadas || usigData.direccionesNormalizadas.length === 0) {
        throw new Error('La dirección ingresada no existe en Capital Federal. Verificá que la calle y la altura sean correctas.');
      }

      // Buscar si alguna de las coincidencias es de CABA
      const cabaMatch = usigData.direccionesNormalizadas.find((d: any) => d.cod_partido === 'caba' || d.nombre_partido === 'CABA');
      if (!cabaMatch) {
        throw new Error('La dirección ingresada no pertenece a Capital Federal. Solo se aceptan comedores en CABA.');
      }

      if (cabaMatch.tipo !== 'calle_altura' || !cabaMatch.altura) {
        throw new Error('Tenés que ingresar una altura válida junto con la calle (ej: Av. Rivadavia 1234).');
      }

      const direccionOficial = cabaMatch.direccion.split(',')[0]; // "MANZANARES 2000"
      
      // Extraer coordenadas
      let latitud = parseFloat(cabaMatch.coordenadas?.y || '0');
      let longitud = parseFloat(cabaMatch.coordenadas?.x || '0');
      
      if (latitud === 0 || longitud === 0) {
        throw new Error('No se pudo obtener la ubicación exacta en el mapa.');
      }

      // Obtener el Barrio oficial de USIG
      const barrioUrl = `https://ws.usig.buenosaires.gob.ar/datos_utiles?calle=${encodeURIComponent(cabaMatch.nombre_calle)}&altura=${cabaMatch.altura}`;
      const barrioResponse = await fetch(barrioUrl);
      const barrioData = await barrioResponse.json();
      
      const barrioDetectado = barrioData.barrio || 'Capital Federal';

      """
      
    text = re.sub(old_logic_pattern, new_logic, text, flags=re.DOTALL)
    
    with open(filepath, 'wb') as f:
        f.write(text.encode('utf-8'))

rewrite_geocoding('src/pages/GestionComedor.tsx')
rewrite_geocoding('src/pages/EditarComedor.tsx')

print("Reescritura a USIG completada")
