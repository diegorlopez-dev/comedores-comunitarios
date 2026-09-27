import re

with open('src/pages/PanelVoluntario.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# Filtrar 'cancelada' para el referente
text = text.replace(
    "return c.requerimiento?.comedor?.usuario_id === user.id;",
    "return c.requerimiento?.comedor?.usuario_id === user.id && c.estado !== 'cancelada';"
)

with open('src/pages/PanelVoluntario.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
