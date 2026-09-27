import re

# Fix GestionComedor: eliminar referencia a setBarrio en el JSX (el input que quedó)
with open('src/pages/GestionComedor.tsx', 'rb') as f:
    gc = f.read().decode('utf-8')

# Buscar y eliminar cualquier referencia restante a setBarrio o barrio en el JSX
gc = re.sub(r'\s*<div>\s*<label[^>]*>[Bb]arrio[^<]*</label>.*?</div>\s*', '\n', gc, flags=re.DOTALL)
# Sacar onChange de barrio si quedó suelto
gc = re.sub(r'\s*onChange=\{\(e\) => setBarrio\(.*?\}\s*', '', gc)

with open('src/pages/GestionComedor.tsx', 'wb') as f:
    f.write(gc.encode('utf-8'))

# Fix DirectorioComedores: eliminar setBarrioFiltro que quedó declarado
with open('src/pages/DirectorioComedores.tsx', 'rb') as f:
    dc = f.read().decode('utf-8')

# Eliminar la declaración completa si quedó con setBarrioFiltro
dc = re.sub(r'const \[barrioFiltro, setBarrioFiltro\] = useState\(.*?\);\n', '', dc)
# Eliminar cualquier uso de barrioFiltro que haya quedado
dc = re.sub(r'\s*\.filter\(c => c\.barrio.*?barrioFiltro.*?\)\)', '', dc, flags=re.DOTALL)

with open('src/pages/DirectorioComedores.tsx', 'wb') as f:
    f.write(dc.encode('utf-8'))

print("Residuos limpiados")
