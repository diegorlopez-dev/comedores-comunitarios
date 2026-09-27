with open('src/pages/DirectorioComedores.tsx', 'rb') as f:
    text = f.read().decode('utf-8')

# 1. Agregar colaboracion confirmada al select query
old_select = "requerimiento_comedor(id, cantidad_necesaria, habilidad(id, nombre))"
new_select = "requerimiento_comedor(id, cantidad_necesaria, habilidad(id, nombre), colaboracion(estado))"
text = text.replace(old_select, new_select)

# 2. Actualizar la interfaz Requerimiento para incluir colaboraciones
old_interface = """interface Requerimiento {
  id: string;
  cantidad_necesaria: number;
  habilidad: Habilidad;
}"""
new_interface = """interface Requerimiento {
  id: string;
  cantidad_necesaria: number;
  habilidad: Habilidad;
  colaboracion?: { estado: string }[];
}"""
text = text.replace(old_interface, new_interface)

# 3. Reemplazar el bloque de renderizado de cupos
old_cupos_block = """                {comedor.requerimiento_comedor.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Sin cupos cargados todavía</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {comedor.requerimiento_comedor.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-3 py-1.5 rounded-xl text-sm"
                      >
                        <span className="font-medium">{req.habilidad.nombre}</span>
                        <span className="text-green-600 text-xs font-bold">({req.cantidad_necesaria} cupos)</span>
                        {userId !== comedor.usuario_id && (
                          <button
                            onClick={() => handlePostular(req.id)}
                            disabled={postulando === req.id || hasActivePostulacion}
                            className="ml-2 text-xs bg-green-600 text-white font-bold py-1 px-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                          >
                            {postulando === req.id ? '...' : hasActivePostulacion ? 'Límite alcanzado' : 'Anotarme'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}"""

new_cupos_block = """                {comedor.requerimiento_comedor.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Sin cupos cargados todavía</p>
                ) : (() => {
                  // Calcular cupos libres por requerimiento
                  const reqsConCuposLibres = comedor.requerimiento_comedor.map(req => {
                    const confirmados = (req.colaboracion || []).filter(c => c.estado === 'confirmada').length;
                    const libres = req.cantidad_necesaria - confirmados;
                    return { ...req, cuposLibres: libres };
                  });
                  const hayAlguno = reqsConCuposLibres.some(r => r.cuposLibres > 0);
                  return (
                    <div className="flex flex-wrap gap-2">
                      {reqsConCuposLibres.map((req) => {
                        const cupoLleno = req.cuposLibres <= 0;
                        return (
                          <div
                            key={req.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border ${cupoLleno ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-green-50 border-green-200 text-green-800'}`}
                          >
                            <span className="font-medium">{req.habilidad.nombre}</span>
                            <span className={`text-xs font-bold ${cupoLleno ? 'text-gray-400' : 'text-green-600'}`}>
                              ({req.cuposLibres > 0 ? `${req.cuposLibres} libre${req.cuposLibres > 1 ? 's' : ''}` : 'sin cupos'})
                            </span>
                            {!cupoLleno && userId !== comedor.usuario_id && (
                              <button
                                onClick={() => handlePostular(req.id)}
                                disabled={postulando === req.id || hasActivePostulacion}
                                className="ml-2 text-xs bg-green-600 text-white font-bold py-1 px-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                              >
                                {postulando === req.id ? '...' : hasActivePostulacion ? 'Límite alcanzado' : 'Anotarme'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {!hayAlguno && <p className="text-xs text-gray-400 italic">Todos los cupos están cubiertos.</p>}
                    </div>
                  );
                })()}"""

text = text.replace(old_cupos_block, new_cupos_block)

with open('src/pages/DirectorioComedores.tsx', 'wb') as f:
    f.write(text.encode('utf-8'))
