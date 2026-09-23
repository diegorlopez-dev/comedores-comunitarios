import re

with open('src/pages/DirectorioComedores.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# 1. Add hasActivePostulacion state
old1 = '  const [userId, setUserId] = useState<string | null>(null);\r\n  const [userRole, setUserRole] = useState<string | null>(null);'
if old1 in text:
    new1 = old1 + '\r\n  const [hasActivePostulacion, setHasActivePostulacion] = useState(false);'
    text = text.replace(old1, new1)
    print('Step 1: OK')
else:
    print('Step 1: NOT FOUND')

# 2. After setUserRole, add check for active postulacion
search2 = 'setUserRole((userData.rol as any).nombre);\r\n        }'
if search2 in text:
    new_block = """setUserRole((userData.rol as any).nombre);
          if ((userData.rol as any).nombre === 'voluntario') {
            const { count } = await supabase
              .from('colaboracion')
              .select('*', { count: 'exact', head: true })
              .eq('voluntario_id', data.user.id)
              .in('estado', ['pendiente', 'confirmada']);
            if (count && count > 0) setHasActivePostulacion(true);
          }
        }"""
    text = text.replace(search2, new_block.replace('\n', '\r\n'))
    print('Step 2: OK')
else:
    print('Step 2: NOT FOUND - searching...')
    idx = text.find('setUserRole')
    print('setUserRole at:', idx)
    print(repr(text[idx:idx+100]))

# 3. Block in handlePostular - add guard
search3 = "    if (!userId) return;\n    \n    setPostulando"
if search3 in text:
    text = text.replace(search3, "    if (!userId) return;\n    if (hasActivePostulacion) {\n      alert('Ya ten\u00e9s una postulaci\u00f3n en curso. Solo pod\u00e9s tener una postulaci\u00f3n activa a la vez.');\n      return;\n    }\n    setPostulando")
    print('Step 3: OK')
else:
    idx = text.find('if (!userId) return;')
    print('Step 3: NOT FOUND')
    print(repr(text[idx:idx+60]))

# 4. Update button label
search4 = "? '...' : 'Anotarme'"
if search4 in text:
    text = text.replace(search4, "? '...' : hasActivePostulacion ? 'L\u00edmite alcanzado' : 'Anotarme'")
    print('Step 4: OK')
else:
    print('Step 4: NOT FOUND')

# 4b. Also disable when hasActivePostulacion
search4b = 'disabled={postulando === req.id}\n                            className'
if search4b in text:
    text = text.replace(search4b, 'disabled={postulando === req.id || hasActivePostulacion}\n                            className')
    print('Step 4b: OK')
else:
    print('Step 4b: NOT FOUND')

with open('src/pages/DirectorioComedores.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
print('Done!')
