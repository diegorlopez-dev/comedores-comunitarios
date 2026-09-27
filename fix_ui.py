with open('src/pages/DirectorioComedores.tsx', 'rb') as f:
    lines = f.read().decode('utf-8', errors='replace').split('\n')

new_block = """                {comedor.requerimiento_comedor.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Sin cupos cargados todavía</p>
                ) : (() => {
                  const reqsProcesados = comedor.requerimiento_comedor.map(req => {
                    const ocupados = (req.colaboracion || []).filter((c: any) => c.estado === 'confirmada' || c.estado === 'pendiente').length;
                    const libres = req.cantidad_necesaria - ocupados;
                    return { ...req, cuposLibres: libres };
                  });
                  return (
                    <div className="flex flex-wrap gap-2">
                      {reqsProcesados.map((req) => {
                        const cupoLleno = req.cuposLibres <= 0;
                        return (
                          <div
                            key={req.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border ${cupoLleno ? 'bg-gray-50 border-gray-200 text-gray-400 opacity-60' : 'bg-green-50 border-green-200 text-green-800'}`}
                          >
                            <span className="font-medium">{req.habilidad.nombre}</span>
                            <span className={`text-xs font-bold ${cupoLleno ? 'text-gray-400' : 'text-green-600'}`}>
                              ({req.cuposLibres > 0 ? `${req.cuposLibres} libre${req.cuposLibres > 1 ? 's' : ''}` : 'sin cupos libres'})
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
                    </div>
                  );
                })()}"""

del lines[320:344]
lines.insert(320, new_block)

with open('src/pages/DirectorioComedores.tsx', 'wb') as f:
    f.write('\n'.join(lines).encode('utf-8'))
