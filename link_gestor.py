import re

with open('src/pages/PanelVoluntario.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# 1. Add import
text = "import { GestorVoluntariados } from './GestorVoluntariados';\n" + text

# 2. Modify render logic
# Find: const isReferente = userRole === 'referente';
# Insert return <GestorVoluntariados />;

replace_target = "  const isReferente = userRole === 'referente';"
replacement = """  if (userRole === 'referente') {
    return <GestorVoluntariados />;
  }
"""

text = text.replace(replace_target, replacement)

with open('src/pages/PanelVoluntario.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
