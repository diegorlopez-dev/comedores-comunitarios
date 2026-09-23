const fs = require('fs');
let dirText = fs.readFileSync('src/pages/DirectorioComedores.tsx', 'utf8');

dirText = dirText.replace(
  'const [userId, setUserId] = useState<string | null>(null);',
  'const [userId, setUserId] = useState<string | null>(null);\n  const [hasActivePostulacion, setHasActivePostulacion] = useState(false);'
);

const fetchUserLogic = \if (userData && (userData.rol as any)?.nombre) {
          setUserRole((userData.rol as any).nombre);
          if ((userData.rol as any).nombre === 'voluntario') {
            const { count } = await supabase.from('colaboracion').select('*', { count: 'exact', head: true }).eq('voluntario_id', data.user.id).in('estado', ['pendiente', 'confirmada']);
            if (count && count > 0) {
              setHasActivePostulacion(true);
            }
          }
        }\;

dirText = dirText.replace(
  /if \(userData && \(userData\.rol as any\)\?\.nombre\) \{\s*setUserRole\(\(userData\.rol as any\)\.nombre\);\s*\}/,
  fetchUserLogic
);

dirText = dirText.replace(
  'if (!userId) return;',
  \if (!userId) return;
    if (hasActivePostulacion) {
      alert('Ya tenés una postulación en curso o confirmada. Solo podés tener una postulación activa a la vez.');
      return;
    }\
);

const buttonOld = /\{userId !== comedor\.usuario_id && \(\s*<button[\s\S]*?<\/button>\s*\)\}/;
const buttonNew = \{userId !== comedor.usuario_id && (
                          <button
                            onClick={() => handlePostular(req.id)}
                            disabled={postulando === req.id || hasActivePostulacion}
                            className=\"ml-2 text-xs bg-green-600 text-white font-bold py-1 px-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition\"
                          >
                            {postulando === req.id ? '...' : (hasActivePostulacion ? 'Límite alcanzado' : 'Anotarme')}
                          </button>
                        )}\;

dirText = dirText.replace(buttonOld, buttonNew);

fs.writeFileSync('src/pages/DirectorioComedores.tsx', dirText, 'utf8');