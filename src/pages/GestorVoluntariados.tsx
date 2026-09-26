import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Voluntario {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
}

interface Colaboracion {
  id: string;
  estado: string;
  fecha_solicitud: string;
  voluntario: Voluntario | null;
}

interface Requerimiento {
  id: string;
  cantidad_necesaria: number;
  habilidad: { id: string; nombre: string } | null;
  colaboraciones: Colaboracion[];
}

export const GestorVoluntariados: React.FC = () => {
  const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }

    // Obtener el comedor del referente
    const { data: comedor } = await supabase
      .from('comedor')
      .select('id')
      .eq('usuario_id', user.id)
      .single();

    if (!comedor) {
      setLoading(false);
      return; // No tiene comedor
    }

    // Obtener requerimientos con sus colaboraciones (postulantes) anidadas
    const { data: reqs, error } = await supabase
      .from('requerimiento_comedor')
      .select(`
        id,
        cantidad_necesaria,
        habilidad (id, nombre),
        colaboracion (
          id, estado, fecha_solicitud,
          voluntario:voluntario_id(id, nombre, telefono, email)
        )
      `)
      .eq('comedor_id', comedor.id);

    if (error) {
      console.error('Error cargando requerimientos:', error);
    } else if (reqs) {
      // Filtrar las colaboraciones canceladas, que no le importan al referente
      const parsedReqs = reqs.map((r: any) => ({
        ...r,
        colaboraciones: (r.colaboracion || []).filter((c: any) => c.estado !== 'cancelada')
      }));
      setRequerimientos(parsedReqs as Requerimiento[]);
    }
    setLoading(false);
  };

  const cambiarEstadoColab = async (id: string, nuevoEstado: string, reqId: string) => {
    const { error } = await supabase
      .from('colaboracion')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else {
      // Actualizar el estado localmente
      setRequerimientos(prev => prev.map(req => {
        if (req.id === reqId) {
          return {
            ...req,
            colaboraciones: req.colaboraciones.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c)
          };
        }
        return req;
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 mt-6">
      <div className="border-2 p-6 rounded-2xl shadow-md bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400/40">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-amber-900">
              🛠️ Gestión de Voluntariados
            </h1>
            <p className="text-slate-600 text-sm">
              Administrá los cupos de tu comedor y las personas postuladas a cada rol.
            </p>
          </div>
          <button 
            onClick={() => navigate('/editar-comedor')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-xl transition text-sm"
          >
            + Agregar otro Puesto
          </button>
        </div>

        {requerimientos.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
            <p className="text-gray-500 font-medium">
              Todavía no cargaste necesidades para tu comedor.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requerimientos.map(req => {
              const confirmados = req.colaboraciones.filter(c => c.estado === 'confirmada').length;
              const pendientes = req.colaboraciones.filter(c => c.estado === 'pendiente');
              const aceptados = req.colaboraciones.filter(c => c.estado === 'confirmada');
              
              const cupo_lleno = confirmados >= req.cantidad_necesaria;

              return (
                <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Cabecera del Puesto */}
                  <div className={`p-4 border-b flex justify-between items-center ${cupo_lleno ? 'bg-gray-100' : 'bg-amber-100/50'}`}>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                        {req.habilidad?.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        Cupos cubiertos: <span className={cupo_lleno ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{confirmados} / {req.cantidad_necesaria}</span>
                      </p>
                    </div>
                    <div>
                      {cupo_lleno ? (
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-red-200">
                          Cupo Lleno
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-green-200">
                          Abierto a postulantes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lista de Postulantes */}
                  <div className="p-4 bg-gray-50">
                    {req.colaboraciones.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Nadie se postuló para este puesto todavía.</p>
                    ) : (
                      <div className="space-y-3">
                        {/* Aceptados primero */}
                        {aceptados.map(colab => (
                          <div key={colab.id} className="flex flex-col md:flex-row justify-between md:items-center bg-white p-3 rounded-lg border border-green-200 shadow-sm">
                            <div>
                              <p className="font-bold text-gray-800 text-sm">✅ {colab.voluntario?.nombre}</p>
                              <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                {colab.voluntario?.telefono && <span>📞 {colab.voluntario.telefono}</span>}
                                {colab.voluntario?.email && <span>✉️ {colab.voluntario.email}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => cambiarEstadoColab(colab.id, 'rechazada', req.id)}
                              className="mt-2 md:mt-0 text-red-500 hover:text-red-700 text-xs underline font-semibold"
                            >
                              Revocar acceso
                            </button>
                          </div>
                        ))}

                        {/* Pendientes después */}
                        {pendientes.map(colab => (
                          <div key={colab.id} className="flex flex-col md:flex-row justify-between md:items-center bg-white p-3 rounded-lg border border-yellow-200 shadow-sm">
                            <div>
                              <p className="font-bold text-gray-800 text-sm">⏳ {colab.voluntario?.nombre}</p>
                              <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                {colab.voluntario?.telefono && <span>📞 {colab.voluntario.telefono}</span>}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2 md:mt-0">
                              <button
                                onClick={() => cambiarEstadoColab(colab.id, 'confirmada', req.id)}
                                disabled={cupo_lleno}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${cupo_lleno ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                              >
                                ✔️ Aceptar
                              </button>
                              <button
                                onClick={() => cambiarEstadoColab(colab.id, 'rechazada', req.id)}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                              >
                                ❌ Rechazar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
