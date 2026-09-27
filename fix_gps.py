with open('src/pages/DirectorioComedores.tsx','rb') as f:
    raw = f.read()
text = raw.decode('utf-8')

# El bloque a reemplazar (userId && con select + boton juntos)
old = (
    '{/* Solo para usuarios logueados */}\r\n'
    '          {userId && (\r\n'
    '            <>\r\n'
    '              <select \r\n'
    '                value={radioKm} \r\n'
    '                onChange={(e) => setRadioKm(Number(e.target.value))}\r\n'
    '                className="p-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-400 font-medium"\r\n'
    '              >\r\n'
    '                <option value={0}>Todos los comedores</option>\r\n'
    '                <option value={2}>A menos de 2 km</option>\r\n'
    '                <option value={5}>A menos de 5 km</option>\r\n'
    '                <option value={10}>A menos de 10 km</option>\r\n'
    '              </select>\r\n'
    '              <button \r\n'
    '                onClick={handleObtenerUbicacion}\r\n'
    '                disabled={buscandoUbicacion}\r\n'
    '                className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"\r\n'
    '              >\r\n'
    "                {buscandoUbicacion ? '\U0001f4cd Buscando...' : '\U0001f4cd Mi ubicaci\u00f3n'}\r\n"
    '              </button>\r\n'
    '            </>\r\n'
    '          )}'
)

new = (
    '{/* Select de radio: solo para logueados con ubicaci\u00f3n */}\r\n'
    '          {userId && userLocation && (\r\n'
    '            <select \r\n'
    '              value={radioKm} \r\n'
    '              onChange={(e) => setRadioKm(Number(e.target.value))}\r\n'
    '              className="p-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-400 font-medium"\r\n'
    '            >\r\n'
    '              <option value={0}>Todos los comedores</option>\r\n'
    '              <option value={2}>A menos de 2 km</option>\r\n'
    '              <option value={5}>A menos de 5 km</option>\r\n'
    '              <option value={10}>A menos de 10 km</option>\r\n'
    '            </select>\r\n'
    '          )}\r\n'
    '          {/* Bot\u00f3n GPS: disponible para todos */}\r\n'
    '          <button \r\n'
    '            onClick={handleObtenerUbicacion}\r\n'
    '            disabled={buscandoUbicacion}\r\n'
    '            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"\r\n'
    '          >\r\n'
    "            {buscandoUbicacion ? '\U0001f4cd Buscando...' : '\U0001f4cd Mi ubicaci\u00f3n'}\r\n"
    '          </button>'
)

print('Old found:', old in text)
if old in text:
    text = text.replace(old, new)
    with open('src/pages/DirectorioComedores.tsx','wb') as f:
        f.write(text.encode('utf-8'))
    print('Done - file updated')
else:
    print('NOT FOUND - showing nearby text')
    idx = text.find('Solo para usuarios logueados')
    print(repr(text[idx:idx+600]))
