import re
with open('src/pages/GestionComedor.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

text = re.sub(r'\s*const latitud = parseFloat\(geoData\[0\]\.lat\);', '', text)
text = re.sub(r'\s*const longitud = parseFloat\(geoData\[0\]\.lon\);', '', text)

with open('src/pages/GestionComedor.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
