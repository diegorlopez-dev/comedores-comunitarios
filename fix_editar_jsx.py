import re

with open('src/pages/EditarComedor.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# Remove the Barrio input block completely
text = re.sub(r'\s*<div>\s*<label[^>]*>Barrio</label>\s*<input[^>]*value=\{barrio\}[^>]*/>\s*</div>', '', text, flags=re.DOTALL)

with open('src/pages/EditarComedor.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
