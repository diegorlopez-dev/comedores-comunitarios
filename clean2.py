import re

# Fix GestionComedor: eliminar el setBarrio('') en el reset
with open('src/pages/GestionComedor.tsx', 'rb') as f:
    gc = f.read().decode('utf-8')

gc = gc.replace("        setBarrio('');\n", "")

with open('src/pages/GestionComedor.tsx', 'wb') as f:
    f.write(gc.encode('utf-8'))

# Fix DirectorioComedores: eliminar el estado + toda la lógica de barrioFiltro
with open('src/pages/DirectorioComedores.tsx', 'rb') as f:
    dc = f.read().decode('utf-8')

# Sacar la declaración
dc = dc.replace("    const [barrioFiltro, setBarrioFiltro] = useState('');\n", "")

# Sacar el bloque if (barrioFiltro.trim()) { ... }
dc = re.sub(
    r'\s*// Filtro por barrio.*?}\s*\n',
    '\n',
    dc,
    flags=re.DOTALL
)

# Sacar de las dependencias del useEffect
dc = dc.replace(", barrioFiltro,", ",")
dc = dc.replace(", barrioFiltro", "")
dc = dc.replace("barrioFiltro, ", "")

with open('src/pages/DirectorioComedores.tsx', 'wb') as f:
    f.write(dc.encode('utf-8'))

print("Listo")
