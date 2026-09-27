import re

with open('src/pages/PanelVoluntario.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# Replace the bad transform: it removed isReferente but left references to it
# We need to add isReferente = false back (since now only voluntarios reach this code path)
replace_target = """  if (userRole === 'referente') {
    return <GestorVoluntariados />;
  }
"""
replacement = """  if (userRole === 'referente') {
    return <GestorVoluntariados />;
  }

  const isReferente = false;
"""

text = text.replace(replace_target, replacement)

with open('src/pages/PanelVoluntario.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
