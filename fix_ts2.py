import re
with open('src/pages/DirectorioComedores.tsx', 'rb') as f:
    text = f.read().decode('utf-8')
text = re.sub(r'\s*const \[setBarrioFiltro\] = useState\(\'\'\);', '', text)
with open('src/pages/DirectorioComedores.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))

with open('src/pages/GestionComedor.tsx', 'rb') as f:
    text = f.read().decode('utf-8')
text = re.sub(r'\s*setBarrio\(\'\'\);', '', text)
with open('src/pages/GestionComedor.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
