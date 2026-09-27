import re

# 1. Update Auth.tsx
with open('src/pages/Auth.tsx', 'rb') as f:
    auth_text = f.read().decode('utf-8')

auth_text = auth_text.replace(
    "const [nombre, setNombre] = useState('');",
    "const [nombre, setNombre] = useState('');\n  const [telefono, setTelefono] = useState('');"
)
auth_text = auth_text.replace(
    "data: { nombre, rol },",
    "data: { nombre, rol, telefono: (rol === 'voluntario' || rol === 'referente') ? telefono : null },"
)

# Insert the Telefono input right before the Email input
phone_input = """            {!isLogin && (rol === 'voluntario' || rol === 'referente') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Ej: 11 1234 5678"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>"""

auth_text = auth_text.replace("""            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>""", phone_input)

with open('src/pages/Auth.tsx', 'wb') as f:
    f.write(auth_text.encode('utf-8'))

# 2. Update PanelVoluntario.tsx
with open('src/pages/PanelVoluntario.tsx', 'rb') as f:
    panel_text = f.read().decode('utf-8')

phone_display = """<div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Mail size={16} />
                            <span>{colab.voluntario?.email}</span>
                          </div>
                          
                          {colab.voluntario?.telefono && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <span title="Teléfono">📞</span>
                              <span>{colab.voluntario?.telefono}</span>
                            </div>
                          )}"""

panel_text = panel_text.replace("""<div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Mail size={16} />
                            <span>{colab.voluntario?.email}</span>
                          </div>""", phone_display)

with open('src/pages/PanelVoluntario.tsx', 'wb') as f:
    f.write(panel_text.encode('utf-8'))

# 3. Update DirectorioComedores.tsx
with open('src/pages/DirectorioComedores.tsx', 'rb') as f:
    dir_text = f.read().decode('utf-8')

# Ensure telefono is selected in the query
dir_text = dir_text.replace(
    "usuario:usuario_id(nombre),",
    "usuario:usuario_id(nombre, telefono),"
)
dir_text = dir_text.replace(
    "usuario: { nombre: string }",
    "usuario: { nombre: string, telefono: string }"
)

comedor_phone = """<p className="text-gray-600 text-sm">{comedor.direccion}</p>
                {comedor.usuario?.telefono && (
                  <p className="text-gray-600 text-sm mt-1">📞 {comedor.usuario.telefono}</p>
                )}"""

dir_text = dir_text.replace("""<p className="text-gray-600 text-sm">{comedor.direccion}</p>""", comedor_phone)

with open('src/pages/DirectorioComedores.tsx', 'wb') as f:
    f.write(dir_text.encode('utf-8'))

print("All updates applied!")
