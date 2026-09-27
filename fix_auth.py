import re

with open('src/pages/Auth.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

phone_input = """            {!isLogin && (rol === 'voluntario' || rol === 'referente') && (
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
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>"""

text = text.replace('<div>\r\n              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>', phone_input)
text = text.replace('<div>\n              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>', phone_input)

# Also need to fix the isFormValid logic! It will fail if they don't enter phone number for voluntario/referente.
valid_logic = """const isFormValid = isLogin 
    ? email.trim() !== '' && password.trim() !== ''
    : email.trim() !== '' && password.trim() !== '' && nombre.trim() !== '' && confirmPassword.trim() !== '' && password === confirmPassword && ((rol === 'voluntario' || rol === 'referente') ? telefono.trim() !== '' : true);"""

old_valid_logic = """const isFormValid = isLogin 
    ? email.trim() !== '' && password.trim() !== ''
    : email.trim() !== '' && password.trim() !== '' && nombre.trim() !== '' && confirmPassword.trim() !== '' && password === confirmPassword;"""

old_valid_logic2 = """const isFormValid = isLogin 
    ? email.trim() !== '' && password.trim() !== ''
    : email.trim() !== '' && password.trim() !== '' && nombre.trim() !== '' && confirmPassword.trim() !== '' && 
password === confirmPassword;"""

# Using regex for form valid
text = re.sub(r'const isFormValid = isLogin\s*\?\s*email\.trim\(\) !== \'\' && password\.trim\(\) !== \'\'\s*:\s*email\.trim\(\) !== \'\' && password\.trim\(\) !== \'\' && nombre\.trim\(\) !== \'\' && confirmPassword\.trim\(\) !== \'\' &&\s*password === confirmPassword;', valid_logic, text)


with open('src/pages/Auth.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
