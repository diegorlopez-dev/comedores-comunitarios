with open('src/pages/PanelVoluntario.tsx', 'rb') as f:
    raw = f.read()
text = raw.decode('utf-8')

text = text.replace(
    'className={"g-gradient-to-br border-2 p-6 rounded-2xl shadow-md "}',
    'className={isReferente ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400/40 p-6 rounded-2xl shadow-md" : "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400/40 p-6 rounded-2xl shadow-md"}'
)
text = text.replace(
    'className={"ext-2xl font-bold mb-1 "}',
    'className={isReferente ? "text-2xl font-bold mb-1 text-amber-900" : "text-2xl font-bold mb-1 text-blue-900"}'
)

with open('src/pages/PanelVoluntario.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
print('Done')
