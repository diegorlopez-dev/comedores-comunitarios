with open('src/App.tsx','rb') as f:
    text = f.read().decode('utf-8')

text = text.replace("import EditarComedor from './pages/EditarComedor';", "import EditarComedor from './pages/EditarComedor';\nimport Confirmacion from './pages/Confirmacion';")

old_route = '<Route path="/login" element={<Auth />} />'
new_route = old_route + '\n          <Route path="/confirmacion" element={<Confirmacion />} />'
text = text.replace(old_route, new_route)

with open('src/App.tsx','wb') as f:
    f.write(text.encode('utf-8'))
