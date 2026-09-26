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

interface Habilidad {
  id: string;
  nombre: string;
}

export const GestorVoluntariados: React.FC = () => {
  const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([]);
  const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
  const [comedorId, setComedorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [nuevaHabilidadId, setNuevaHabilidadId] = useState('');
  const [nuevaCantidad, setNuevaCantidad] = useState(1);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }

    const [{ data: comedor }, { data: habs }] = await Promise.all([
      supabase.from('comedor').select('id').eq('usuario_id', user.id).single(),
      supabase.from('habilidad').select('id, nombre').order('nombre')
    ]);

    if (!comedor) { setLoading(false); return; }

    setComedorId(comedor.id);
    setHabilidades((habs || []) as Habilidad[]);
    if (habs && habs.length > 0) setNuevaHabilidadId(habs[0].id);

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

    if (!error && reqs) {
      const parsed = reqs.map((r: any) => ({
        ...r,
        colaboraciones: (r.colaboracion || []).filter((c: any) => c.estado !== 'cancelada')
      }));
      setRequerimientos(parsed as Requerimiento[]);
    }
    setLoading(false);
  };

  const agregarPuesto = async () => {
    if (!comedorId || !nuevaHabilidadId) return;
    setGuardandoNuevo(true);

    // Verificar si ya existe ese rol para este comedor
    const existente = requerimientos.find(r => r.habilidad?.id === nuevaHabilidadId);

    if (existente) {
      // Solo sumar la cantidad al requerimiento ya existente
      const { error } = await supabase
        .from('requerimiento_comedor')
        .update({ cantidad_necesaria: existente.cantidad_necesaria + nuevaCantidad })
        .eq('id', existente.id);
      if (error) {
        alert('Error al actualizar el puesto: ' + error.message);
      } else {
        setMostrarFormNuevo(false);
        setNuevaCantidad(1);
        await cargarDatos();
      }
    } else {
      // Insertar normalmente
      const { error } = await supabase.from('requerimiento_comedor').insert({
        comedor_id: comedorId,
        habilidad_id: nuevaHabilidadId,
        cantidad_necesaria: nuevaCantidad,
      });
      if (error) {
        alert('Error al agregar el puesto: ' + error.message);
      } else {
        setMostrarFormNuevo(false);
        setNuevaCantidad(1);
        await cargarDatos();
      }
    }
    setGuardandoNuevo(false);
  };

  const cambiarEstadoColab = async (id: string, nuevoEstado: string, reqId: string) => {
    const { error } = await supabase.from('colaboracion').update({ estado: nuevoEstado }).eq('id', id);
    if (error) {
      alert('Error al actualizar: ' + error.message);
    } else {
      setRequerimientos(prev => prev.map(req =>
        req.id === reqId
          ? { ...req, colaboraciones: req.colaboraciones.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c) }
          : req
      ));
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

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-amber-900">🛠️ Gestión de Voluntariados</h1>
            <p className="text-slate-600 text-sm">Administrá los cupos de tu comedor y las personas postuladas a cada rol.</p>
          </div>
          <button
            onClick={() => setMostrarFormNuevo(v => !v)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-xl transition text-sm"
          >
            {mostrarFormNuevo ? '✕ Cancelar' : '+ Agregar Puesto'}
          </button>
        </div>

        {/* Formulario para agregar nuevo puesto */}
        {mostrarFormNuevo && (
          <div className="bg-white border border-amber-200 rounded-xl p-4 mb-6 shadow-sm">
            <h3 className="font-bold text-amber-900 mb-3 text-sm uppercase tracking-wide">Nuevo Puesto de Voluntariado</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol / Habilidad</label>
                <select
                  value={nuevaHabilidadId}
                  onChange={e => setNuevaHabilidadId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                >
                  {habilidades.map(h => (
                    <option key={h.id} value={h.id}>{h.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="block text-xs font-medium text-gray-600 mb-1">Cupos necesarios</label>
                <input
                  type="number"
                  min={1}
                  value={nuevaCantidad}
                  onChange={e => setNuevaCantidad(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 text-sm text-center"
                />
              </div>
              <button
                onClick={agregarPuesto}
                disabled={guardandoNuevo}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition disabled:opacity-50"
              >
                {guardandoNuevo ? 'Guardando...' : '✔ Guardar'}
              </button>
            </div>
          </div>
        )}

        {/* Grilla de puestos */}
        {requerimientos.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
            <p className="text-gray-500 font-medium mb-2">Todavía no hay puestos de voluntariado cargados.</p>
            <p className="text-gray-400 text-sm">Usá el botón <strong>"+ Agregar Puesto"</strong> para empezar.</p>
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
                      <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{req.habilidad?.nombre}</h3>
                      <p className="text-sm text-gray-600 font-medium">
                        Cupos cubiertos:{' '}
                        <span className={cupo_lleno ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                          {confirmados} / {req.cantidad_necesaria}
                        </span>
                      </p>
                    </div>
                    <div>
                      {cupo_lleno ? (
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-red-200">
                          Cupo Lleno
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-green-200">
                          Abierto
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lista de Postulantes */}
                  <div className="p-4 bg-gray-50">
                    {req.colaboraciones.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">Nadie se postuló para este puesto todavía.</p>
                    ) : (
                      <div className="space-y-3">
                        {/* Aceptados */}
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

                        {/* Pendientes */}
                        {pendientes.map(colab => (
                          <div key={colab.id} className="flex flex-col md:flex-row justify-between md:items-center bg-white p-3 rounded-lg border border-yellow-200 shadow-sm">
                            <div>
                              <p className="font-bold text-gray-800 text-sm">⏳ {colab.voluntario?.nombre}</p>
                              <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                {colab.voluntario?.telefono && <span>📞 {colab.voluntario.telefono}</span>}
                                {colab.voluntario?.email && <span>✉️ {colab.voluntario.email}</span>}
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
