import re

# ============================================================
# 1. GestionComedor.tsx - sacar barrio del form, auto-detectarlo
# ============================================================
with open('src/pages/GestionComedor.tsx', 'rb') as f:
    gc = f.read().decode('utf-8')

# a) Eliminar el estado de barrio
gc = gc.replace("  const [barrio, setBarrio] = useState('');\n", "")

# b) Reemplazar la validación del barrio + save por auto-detección
old_barrio_check = """      // Validar que el barrio ingresado coincida con el resultado del mapa
      const normalize = (s: string) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
      const displayName = geoData[0].display_name || '';
      if (!normalize(displayName).includes(normalize(barrio))) {
        throw new Error(`El mapa ubicó esta dirección en: "${displayName.split(',').slice(0,3).join(',')}, ...". Verificá que el barrio sea correcto.`);
      }

      const latitud = parseFloat(geoData[0].lat);
      const longitud = parseFloat(geoData[0].lon);"""

new_barrio_extract = """      // Extraer barrio automáticamente del resultado del mapa
      const barrioDetectado = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || 'Capital Federal';
      const latitud = parseFloat(geoData[0].lat);
      const longitud = parseFloat(geoData[0].lon);"""

gc = gc.replace(old_barrio_check, new_barrio_extract)

# c) Usar barrioDetectado en el insert
gc = gc.replace(
    "{ nombre, barrio, direccion,",
    "{ nombre, barrio: barrioDetectado, direccion,"
)

# d) Sacar el campo de barrio del JSX del form
# Encontrar y eliminar el bloque del input de barrio
gc = re.sub(
    r'        <div>\s*<label[^>]*>Barrio \*</label>\s*<input[^/]*/>\s*</div>\s*\n',
    '',
    gc
)

# e) Actualizar el disabled del botón para no requerir barrio
gc = gc.replace(
    "disabled={guardando || !nombre.trim() || !barrio.trim() || !direccion.trim() || !diasYHorarios.trim()}",
    "disabled={guardando || !nombre.trim() || !direccion.trim() || !diasYHorarios.trim()}"
)

# f) Actualizar el mensaje de error de not-found para que no diga "barrio"
gc = gc.replace(
    'No pudimos encontrar esta dirección en Capital Federal. Verificá que la calle, altura y barrio sean correctos.',
    'No pudimos encontrar esta dirección en Capital Federal. Verificá que la calle y la altura sean correctos.'
)

with open('src/pages/GestionComedor.tsx', 'wb') as f:
    f.write(gc.encode('utf-8'))

print("GestionComedor actualizado")

# ============================================================
# 2. DirectorioComedores.tsx - sacar el filtro de barrio
# ============================================================
with open('src/pages/DirectorioComedores.tsx', 'rb') as f:
    dc = f.read().decode('utf-8')

# Sacar el estado de barrioFiltro
dc = dc.replace("  const [barrioFiltro, setBarrioFiltro] = useState('');\n", "")

# Sacar la lógica de filtro por barrio
dc = dc.replace(
    "    const porBarrio = barrioFiltro.trim()\n      ? cs.filter(c => c.barrio?.toLowerCase().includes(barrioFiltro.toLowerCase()))\n      : cs;\n",
    ""
)
# Alternativa si la regex es diferente, buscar otra forma
dc = re.sub(r'    const porBarrio = barrioFiltro\.trim\(\).*?: cs;\n', '', dc, flags=re.DOTALL)

# Reemplazar referencias a porBarrio
dc = dc.replace("setComedoresFiltrados(porBarrio);", "setComedoresFiltrados(cs);")

# Sacar el input de barrio del JSX
dc = re.sub(
    r'\s*\{/\* Filtro por barrio - disponible para todos \*/\}\s*<input[^/]*/>\s*',
    '\n          ',
    dc
)

# Actualizar subtítulo (ya no hay buscar por barrio)
dc = dc.replace(
    "{userId ? 'Usá tu ubicación o buscá por barrio.' : 'Buscá por barrio o registrate para dar reseñas!'}",
    "{userId ? 'Usá el GPS para encontrar comedores cercanos.' : 'Registrate para dar reseñas y encontrar comedores cercanos.'}"
)

with open('src/pages/DirectorioComedores.tsx', 'wb') as f:
    f.write(dc.encode('utf-8'))

print("DirectorioComedores actualizado")
