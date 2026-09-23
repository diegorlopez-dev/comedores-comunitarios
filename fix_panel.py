with open('src/pages/PanelVoluntario.tsx', 'rb') as f:
    raw = f.read()
text = raw.decode('utf-8')

# Fix broken className template literals (backtick got corrupted to \x08)
bad1 = 'className={\x08g-gradient-to-br border-2 p-6 rounded-2xl shadow-md }'
good1 = 'className={g-gradient-to-br border-2 p-6 rounded-2xl shadow-md }'
text = text.replace(bad1, good1)
print('Fix 1:', 'OK' if good1 in text else 'FAILED')

bad2 = 'className={\x14ext-2xl font-bold mb-1 }'
good2 = 'className={	ext-2xl font-bold mb-1 }'
text = text.replace(bad2, good2)
print('Fix 2:', 'OK' if good2 in text else 'FAILED')

# Also find similar patterns
import re
bad_patterns = re.findall(r'className=\{[^\x00-\x07\x09-\x1f]*[\x08].*?\}', text)
print('Remaining bad patterns:', bad_patterns)

with open('src/pages/PanelVoluntario.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
print('Done')
