import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Habilidad {
  id: string;
  nombre: string;
}

interface Requerimiento {
  id: string;
  cantidad_necesaria: number;
  habilidad: Habilidad;
}

interface Comedor {
  id: string;
  nombre: string;
  barrio: string;
  descripcion: string;
  requerimiento_comedor: Requerimiento[];
}

const PostulacionVoluntario: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [comedores, setComedores] = useState<Comedor[]>([]);
  const [postulando, setPostulando] = useState<string | null>(null); // ID del req en progreso
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerUsuarioLogueado = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        navigate('/login');
      } else {
        setUserId(data.user.id);
      }
    };

    const cargarComedores = async () => {
      const { data, error } = await supabase
        .from('comedor')
        .select('id, nombre, barrio, descripcion, requerimiento_comedor(id, cantidad_necesaria, habilidad(id, nombre))');
      if (!error && data) {
        setComedores(data as unknown as Comedor[]);
      }
    };

    obtenerUsuarioLogueado();
    cargarComedores();
  }, []);

  const handlePostular = async (requerimientoId: string) => {
    if (!userId) {
      navigate('/login');
      return;
    }
    setPostulando(requerimientoId);
    const { error } = await supabase.from('colaboracion').insert({
      voluntario_id: userId,
      requerimiento_id: requerimientoId,
      estado: 'pendiente',
    });

    if (error) {
      alert('Error al postularte. Es posible que ya estés anotado en este cupo.');
      console.error(error);
    } else {
      alert('¡Postulación exitosa! El referente del comedor va a recibir tu solicitud.');
    }
    setPostulando(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pt-6 space-y-4">
      <h2 className="text-2xl font-bold text-green-800 mb-4">🤝 Anotarme como Voluntario</h2>

      {comedores.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No hay comedores con cupos disponibles por el momento.</p>
      )}

      {comedores.map((comedor) => (
        <div key={comedor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-800">{comedor.nombre}</h3>
            <p className="text-sm text-gray-500">📍 {comedor.barrio}</p>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{comedor.descripcion}</p>
          </div>

          {comedor.requerimiento_comedor.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Sin cupos cargados todavía</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-3">
              {comedor.requerimiento_comedor.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-3 py-1.5 rounded-full text-sm"
                >
                  <span className="font-medium">{req.habilidad.nombre}</span>
                  <span className="text-green-600 text-xs">({req.cantidad_necesaria} cupos)</span>
                  <button
                    onClick={() => handlePostular(req.id)}
                    disabled={postulando === req.id}
                    className="ml-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded-full disabled:opacity-50 transition-colors"
                  >
                    {postulando === req.id ? '...' : 'Anotarme'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostulacionVoluntario;
