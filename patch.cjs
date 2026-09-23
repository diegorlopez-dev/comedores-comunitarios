const fs = require('fs');

// Patch DirectorioComedores.tsx
let dirText = fs.readFileSync('src/pages/DirectorioComedores.tsx', 'utf8');

dirText = dirText.replace('distanciaKm?: number;\n  usuario?:', 'distanciaKm?: number;\n  usuario_id?: string;\n  usuario?:');
dirText = dirText.replace('longitud, usuario:usuario_id', 'longitud, usuario_id, usuario:usuario_id');

const postularNew = `  const handlePostular = async (requerimientoId: string) => {
    if (!userId) return;
    
    setPostulando(requerimientoId);
    const { error } = await supabase.from('colaboracion').insert({
      voluntario_id: userId,
      requerimiento_id: requerimientoId,
      estado: 'pendiente',
    });

    if (error) {
      alert('Error al postularte. Es posible que ya estés anotado en este cupo.');
    } else {
      alert('¡Postulación exitosa! El referente del comedor va a recibir tu solicitud.');
      const updater = (prev) => prev.map(c => ({
        ...c,
        requerimiento_comedor: c.requerimiento_comedor.map(req => 
          req.id === requerimientoId 
            ? { ...req, cantidad_necesaria: Math.max(0, req.cantidad_necesaria - 1) } 
            : req
        )
      }));
      setComedoresOriginales(updater);
      setComedoresMostrar(updater);
    }
    setPostulando(null);
  };`;

dirText = dirText.replace(/const handlePostular = async[\s\S]*?setPostulando\(null\);\s*\};\s*/, postularNew + "\n");

const btnOld = /<button\s+onClick=\{\(\) => handlePostular\(req\.id\)\}\s+disabled=\{postulando === req\.id\}\s+className="ml-2 text-xs bg-green-600 text-white font-bold py-1 px-2\.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"\s*>\s*\{postulando === req\.id \? '\.\.\.' : 'Anotarme'\}\s*<\/button>/g;

const btnNew = `{userId !== comedor.usuario_id && (
                          <button
                            onClick={() => handlePostular(req.id)}
                            disabled={postulando === req.id}
                            className="ml-2 text-xs bg-green-600 text-white font-bold py-1 px-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                          >
                            {postulando === req.id ? '...' : 'Anotarme'}
                          </button>
                        )}`;

dirText = dirText.replace(btnOld, btnNew);
fs.writeFileSync('src/pages/DirectorioComedores.tsx', dirText, 'utf8');

// Patch MapaComedores.tsx
let mapText = fs.readFileSync('src/components/MapaComedores.tsx', 'utf8');
mapText = mapText.replace('export interface ComedorMapa {', 'export interface ComedorMapa {\n  direccion?: string;\n  dias_y_horarios?: string;\n  resena?: { puntuacion: number }[];');

const oldMap = /\{comedores\.map\(\s*c\s*=>\s*\{[\s\S]*?return\s+null;\s*\}\)\}/;
const newMap = `{comedores.map(c => {
          if (c.latitud && c.longitud) {
            const prom = c.resena && c.resena.length > 0 
              ? (c.resena.reduce((a, b) => a + b.puntuacion, 0) / c.resena.length).toFixed(1) 
              : null;
            return (
              <Marker key={c.id} position={[c.latitud, c.longitud]}>
                <Popup>
                  <div className="text-sm">
                    <strong className="text-base text-gray-800">{c.nombre}</strong><br/>
                    {prom && <span className="text-xs text-yellow-600 font-bold">⭐ {prom} / 5</span>}<br/>
                    <span className="text-gray-600">📍 {c.barrio} {c.direccion && \`- \${c.direccion}\`}</span><br/>
                    {c.dias_y_horarios && <span className="text-gray-500 text-xs">🕒 {c.dias_y_horarios}</span>}
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}`;

mapText = mapText.replace(oldMap, newMap);
fs.writeFileSync('src/components/MapaComedores.tsx', mapText, 'utf8');
console.log('Done!');
