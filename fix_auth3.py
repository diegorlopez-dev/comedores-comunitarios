import re

with open('src/pages/Auth.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

pattern = r'(</select>\s*</div>)'
match = re.search(pattern, text)
if match:
    replacement = match.group(1) + """
            
            {!isLogin && (rol === 'voluntario' || rol === 'referente') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                  placeholder="Ej: 11 1234 5678"
                />
              </div>
            )}"""
    text = text.replace(match.group(1), replacement)

    with open('src/pages/Auth.tsx', 'wb') as f:
        f.write(text.encode('utf-8'))
    print("Replaced!")
else:
    print("Not found")
