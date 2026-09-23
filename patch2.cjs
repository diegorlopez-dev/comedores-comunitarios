const fs = require('fs');

let dirText = fs.readFileSync('src/pages/DirectorioComedores.tsx', 'utf8');

dirText = dirText.replace('(prev) => prev.map', '(prev: Comedor[]) => prev.map');
dirText = dirText.replace('usuario?: { telefono?: string; nombre?: string };', 'usuario_id?: string;\n  usuario?: { telefono?: string; nombre?: string };');

fs.writeFileSync('src/pages/DirectorioComedores.tsx', dirText, 'utf8');
