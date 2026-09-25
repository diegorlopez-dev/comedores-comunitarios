import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Colaboracion {
  id: string;
  estado: string;
  fecha_solicitud: string;
  voluntario: { id: string; nombre: string; telefono?: string; email?: string } | null;
  requerimiento: {
    id: string;
    cantidad_necesaria: number;
    habilidad: { nombre: string };
    comedor: { id: string; nombre: string; barrio: string; usuario_id: string } | null;
  } | null;
}

const PanelVoluntario: React.FC = () => {
  const [colaboraciones, setColaboraciones] = useState<Colaboracion[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }

    const { data: userData } = await supabase
      .from('usuario')
      .select('rol(nombre)')
      .eq('id', user.id)
      .single();

    const role = (userData?.rol as any)?.nombre ?? null;
    setUserRole(role);

    const { data: colabs, error } = await supabase
      .from('colaboracion')
      .select(`
        id, estado, fecha_solicitud,
        voluntario:voluntario_id(id, nombre, telefono, email),
        requerimiento:requerimiento_comedor(
          id, cantidad_necesaria,
          habilidad(nombre),
          comedor(id, nombre, barrio, usuario_id)
        )
      `)
      .order('fecha_solicitud', { ascending: false });

    if (error) {
      console.error('Error cargando colaboraciones:', error);
    } else if (colabs) {
      const filtradas = colabs.filter((c: any) => {
        if (role === 'referente') {
          return c.requerimiento?.comedor?.usuario_id === user.id && c.estado !== 'cancelada';
        }
        return c.voluntario?.id === user.id;
      });
      setColaboraciones(filtradas as unknown as Colaboracion[]);
    }
    setLoading(false);
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from('colaboracion')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else {
      setColaboraciones(prev => prev.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const isReferente = userRole === 'referente';

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800',
      cancelada: 'bg-gray-100 text-gray-600',
    };
    return map[estado] ?? 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 mt-6">
      <div className={`border-2 p-6 rounded-2xl shadow-md ${isReferente ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400/40' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400/40'}`}>
        <h1 className={`text-2xl font-bold mb-1 ${isReferente ? 'text-amber-900' : 'text-blue-900'}`}>
          {isReferente ? '📋 Postulantes a mi Comedor' : '🤝 Mis Postulaciones'}
        </h1>
        <p className="text-slate-600 text-sm mb-6">
          {isReferente
            ? 'Revisá las solicitudes de voluntarios y aceptá o rechazá cada una.'
            : 'Seguí el estado de tus solicitudes de voluntariado.'}
        </p>

        {colaboraciones.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
            <p className="text-4xl mb-3">{isReferente ? '📭' : '🔍'}</p>
            <p className="text-gray-500 font-medium">
              {isReferente ? 'No hay solicitudes pendientes para tu comedor.' : 'Todavía no te postulaste a ningún comedor.'}
            </p>
            {!isReferente && (
              <button
                onClick={() => navigate('/')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition"
              >
                Buscar Comedores
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {colaboraciones.map(colab => {
              const req = colab.requerimiento;
              const vol = colab.voluntario;
              const comedor = req?.comedor;

              return (
                <div key={colab.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      {isReferente ? (
                        <>
                          <p className="font-bold text-gray-800 text-base">
                            {vol?.nombre ?? 'Voluntario'} <span className="font-normal text-gray-500 text-sm">quiere ayudar como</span> <span className="text-amber-700 font-semibold">{req?.habilidad?.nombre}</span>
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                            {vol?.telefono && <span>📞 {vol.telefono}</span>}
                            {vol?.email && <span>✉️ {vol.email}</span>}
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-gray-800 text-base">
                            Postulación para: <span className="text-blue-700">{req?.habilidad?.nombre}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            📍 {comedor?.nombre} — {comedor?.barrio}
                          </p>
                        </>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Enviada el {new Date(colab.fecha_solicitud).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${estadoBadge(colab.estado)}`}>
                        {colab.estado}
                      </span>

                      {isReferente && colab.estado === 'pendiente' && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => cambiarEstado(colab.id, 'confirmada')}
                            className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition"
                          >
                            ✓ Aceptar
                          </button>
                          <button
                            onClick={() => cambiarEstado(colab.id, 'rechazada')}
                            className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition"
                          >
                            ✗ Rechazar
                          </button>
                        </div>
                      )}

                      {!isReferente && colab.estado === 'pendiente' && (
                        <button
                          onClick={() => cambiarEstado(colab.id, 'cancelada')}
                          className="text-red-500 hover:text-red-700 text-xs underline font-semibold mt-1"
                        >
                          Cancelar postulación
                        </button>
                      )}
                    </div>
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

export default PanelVoluntario;