import re

with open('src/pages/DirectorioComedores.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# 1. Agregar el estado
state_search = "const [radioKm, setRadioKm] = useState<number>(0);"
state_replace = "const [barrioFiltro, setBarrioFiltro] = useState('');\n  const [radioKm, setRadioKm] = useState<number>(0);"
text = text.replace(state_search, state_replace)

# 2. Agregar la lógica del filtro en el useEffect
filter_search = """      if (radioKm > 0) {
        lista = lista.filter(c => (c.distanciaKm || 9999) <= radioKm);
      }
    }"""
filter_replace = """      if (radioKm > 0) {
        lista = lista.filter(c => (c.distanciaKm || 9999) <= radioKm);
      }
    }

    if (barrioFiltro.trim()) {
      lista = lista.filter(c => c.barrio?.toLowerCase().includes(barrioFiltro.toLowerCase()));
    }"""
text = text.replace(filter_search, filter_replace)

# 3. Agregar la dependencia al useEffect
dep_search = "}, [userLocation, radioKm, comedoresOriginales]);"
dep_replace = "}, [userLocation, radioKm, barrioFiltro, comedoresOriginales]);"
text = text.replace(dep_search, dep_replace)

# 4. Agregar el input en el JSX (antes del select de radioKm)
jsx_search = """        <div className="flex flex-col sm:flex-row gap-3">
          {/* Select de radio: solo para logueados con ubicación */}"""
jsx_replace = """        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={barrioFiltro}
            onChange={(e) => setBarrioFiltro(e.target.value)}
            placeholder="Buscar por barrio..."
            className="p-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-400 flex-1 min-w-[200px]"
          />
          {/* Select de radio: solo para logueados con ubicación */}"""
text = text.replace(jsx_search, jsx_replace)

with open('src/pages/DirectorioComedores.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))

print("Restored")
