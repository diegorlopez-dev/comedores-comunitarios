with open('src/pages/EditarComedor.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

bad_block = """        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Barrio</label>
          <input required type="text" value={barrio} onChange={e => setBarrio(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
        </div>"""

text = text.replace(bad_block, "")

with open('src/pages/EditarComedor.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
