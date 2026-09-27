import re

def fix_geocoding(filepath):
    with open(filepath, 'rb') as f:
        text = f.read().decode('utf-8')

    # Reemplazar la llamada a Nominatim para que:
    # 1. Busque solo en CABA (countrycodes=ar + viewbox de CABA)
    # 2. Pida addressdetails=1 para validar que sea una calle (road)
    old_query = """      const queryGeocoding = encodeURIComponent(`${direccion}, ${barrio}, Argentina`);
      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${queryGeocoding}`);
      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        throw new Error('No pudimos encontrar la ubicación en el mapa. Por favor, verificá que la dirección y el barrio sean correctos.');
      }"""

    old_query_edit = """        const queryGeocoding = encodeURIComponent(`${direccion}, ${barrio}, Argentina`);
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${queryGeocoding}`);
        const geoData = await geoResponse.json();
        if (!geoData || geoData.length === 0) {
          throw new Error('No pudimos encontrar la ubicación en el mapa. Por favor, verificá que la dirección y el barrio sean correctos.');
        }"""

    new_query = """      // Buscar solo en CABA con addressdetails para validar que sea una calle real
      const queryGeocoding = encodeURIComponent(`${direccion}, Ciudad Autónoma de Buenos Aires, Argentina`);
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ar&q=${queryGeocoding}&viewbox=-58.5312,-34.7052,-58.3341,-34.5272&bounded=1`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        throw new Error('No pudimos encontrar esta dirección en Capital Federal. Verificá que la calle, altura y barrio sean correctos.');
      }

      // Validar que Nominatim haya encontrado una CALLE (no una estación, plaza, etc.)
      const addr = geoData[0].address || {};
      if (!addr.road) {
        throw new Error('La dirección ingresada no corresponde a una calle válida en Capital Federal. Usá el formato "Calle Altura" (ej: Av. Rivadavia 1234).');
      }

      // Validar que el barrio ingresado coincida con el resultado del mapa
      const normalize = (s: string) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
      const displayName = geoData[0].display_name || '';
      if (!normalize(displayName).includes(normalize(barrio))) {
        throw new Error(`El mapa ubicó esta dirección en: "${displayName.split(',').slice(0,3).join(',')}, ...". Verificá que el barrio sea correcto.`);
      }"""

    new_query_edit = """        // Buscar solo en CABA con addressdetails para validar que sea una calle real
        const queryGeocoding = encodeURIComponent(`${direccion}, Ciudad Autónoma de Buenos Aires, Argentina`);
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ar&q=${queryGeocoding}&viewbox=-58.5312,-34.7052,-58.3341,-34.5272&bounded=1`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        
        if (!geoData || geoData.length === 0) {
          throw new Error('No pudimos encontrar esta dirección en Capital Federal. Verificá que la calle, altura y barrio sean correctos.');
        }

        // Validar que Nominatim haya encontrado una CALLE (no una estación, plaza, etc.)
        const addr = geoData[0].address || {};
        if (!addr.road) {
          throw new Error('La dirección ingresada no corresponde a una calle válida en Capital Federal. Usá el formato "Calle Altura" (ej: Av. Rivadavia 1234).');
        }

        // Validar que el barrio ingresado coincida con el resultado del mapa
        const normalize = (s: string) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
        const displayName = geoData[0].display_name || '';
        if (!normalize(displayName).includes(normalize(barrio))) {
          throw new Error(`El mapa ubicó esta dirección en: "${displayName.split(',').slice(0,3).join(',')}, ...". Verificá que el barrio sea correcto.`);
        }"""

    if 'GestionComedor' in filepath:
        text = text.replace(old_query, new_query)
    else:
        text = text.replace(old_query_edit, new_query_edit)

    with open(filepath, 'wb') as f:
        f.write(text.encode('utf-8'))
    print(f"Updated: {filepath}")

fix_geocoding('src/pages/GestionComedor.tsx')
fix_geocoding('src/pages/EditarComedor.tsx')
