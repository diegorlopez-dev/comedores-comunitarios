import re

# 1. Restringir números en Auth.tsx
with open('src/pages/Auth.tsx', 'rb') as f:
    auth_text = f.read().decode('utf-8')

auth_text = auth_text.replace(
    "onChange={(e) => setTelefono(e.target.value)}",
    "onChange={(e) => setTelefono(e.target.value.replace(/\\D/g, ''))}"
)

with open('src/pages/Auth.tsx', 'wb') as f:
    f.write(auth_text.encode('utf-8'))

# 2. Cambiar subtitulo en DirectorioComedores.tsx
with open('src/pages/DirectorioComedores.tsx', 'rb') as f:
    dir_text = f.read().decode('utf-8')

dir_text = dir_text.replace(
    "Buscá por barrio o registrate para usar el GPS.",
    "Buscá por barrio o registrate para dar reseñas!"
)
# También arreglar la mayúscula y el acento si el usuario quería eso.

with open('src/pages/DirectorioComedores.tsx', 'wb') as f:
    f.write(dir_text.encode('utf-8'))

print("Hecho!")
