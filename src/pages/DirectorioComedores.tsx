import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import MapaComedores, { type ComedorMapa } from '../components/MapaComedores';
import { calcularDistancia } from '../utils/distance';

interface Habilidad {
  id: string;
  nombre: string;
}

interface Requerimiento {
  id: string;
  cantidad_necesaria: number;
  habilidad: Habilidad;
}

interface Resena {
  id: number;
  puntuacion: number;
  comentario: string;
}

interface Comedor extends ComedorMapa {
  descripcion: string;
  direccion: string;
  cbu_alias: string | null;
  requerimiento_comedor: Requerimiento[];
  resena: Resena[]; // Agregado vía MultiMCP
  distanciaKm?: number;
}

const PostulacionVoluntario: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Añadido
  const [comedoresOriginales, setComedoresOriginales] = useState<Comedor[]>([]);
  const [comedoresMostrar, setComedoresMostrar] = useState<Comedor[]>([]);
  const [postulando, setPostulando] = useState<string | null>(null);
  const [donacionModal, setDonacionModal] = useState<Comedor | null>(null);
  const [resenaModal, setResenaModal] = useState<Comedor | null>(null); // Modal reseñas
  const [puntuacion, setPuntuacion] = useState<number>(5);
  const [comentario, setComentario] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [barrioFiltro, setBarrioFiltro] = useState('');
  const [radioKm, setRadioKm] = useState<number>(0); // 0 = sin límite

  const navigate = useNavigate();

  useEffect(() => {
    const obtenerUsuarioLogueado = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setUserId(data.user.id);
        // Buscar el rol
        const { data: userData } = await supabase
          .from('usuario')
          .select('rol(nombre)')
          .eq('id', data.user.id)
          .single();
          
        if (userData && (userData.rol as any)?.nombre) {
          setUserRole((userData.rol as any).nombre);
        }
      }
    };

    const cargarComedores = async () => {
      const { data, error } = await supabase
        .from('comedor')
        .select('id, nombre, barrio, direccion, descripcion, cbu_alias, latitud, longitud, requerimiento_comedor(id, cantidad_necesaria, habilidad(id, nombre)), resena(id, puntuacion, comentario)');
      if (!error && data) {
        setComedoresOriginales(data as unknown as Comedor[]);
        setComedoresMostrar(data as unknown as Comedor[]);
      }
    };

    obtenerUsuarioLogueado();
    cargarComedores();
  }, [navigate]);

  useEffect(() => {
    let lista = [...comedoresOriginales];

    // Filtro por barrio (para todos, incluso sin login)
    if (barrioFiltro.trim()) {
      lista = lista.filter(c =>
        c.barrio.toLowerCase().includes(barrioFiltro.toLowerCase())
      );
    }

    if (userLocation) {
      // Calcular distancias
      lista = lista.map(c => {
        if (c.latitud && c.longitud) {
          return {
            ...c,
            distanciaKm: calcularDistancia(userLocation.lat, userLocation.lng, c.latitud, c.longitud)
          };
        }
        return c;
      });

      // Ordenar por más cercano
      lista.sort((a, b) => (a.distanciaKm || 9999) - (b.distanciaKm || 9999));

      // Filtrar por radio si está seleccionado
      if (radioKm > 0) {
        lista = lista.filter(c => (c.distanciaKm || 9999) <= radioKm);
      }
    }

    setComedoresMostrar(lista);
  }, [userLocation, radioKm, barrioFiltro, comedoresOriginales]);

  const handleObtenerUbicacion = () => {
    setBuscandoUbicacion(true);
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      setBuscandoUbicacion(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setBuscandoUbicacion(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No pudimos obtener tu ubicación. Por favor verificá los permisos de tu navegador.');
        setBuscandoUbicacion(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePostular = async (requerimientoId: string) => {
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
    }
    setPostulando(null);
  };
  const calcularPromedioEstrellas = (resenas?: Resena[]) => {
    if (!resenas || resenas.length === 0) return 0;
    const sum = resenas.reduce((acc, resena) => acc + resena.puntuacion, 0);
    return sum / resenas.length;
  };

  const handleVerResenas = (comedor: Comedor) => {
    setResenaModal(comedor);
    setPuntuacion(5);
    setComentario('');
  };

  const handleDejarResena = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('Debes iniciar sesión para comentar.');
      return;
    }
    if (userRole !== 'comensal') {
      alert('Solo los comensales pueden dejar reseñas.');
      return;
    }
    
    if (resenaModal) {
      const { error } = await supabase.from('resena').insert([
        {
          comedor_id: resenaModal.id,
          usuario_id: userId,
          puntuacion,
          comentario,
        },
      ]);
      
      if (!error) {
        alert('Reseña guardada con éxito.');
        setResenaModal(null);
        setPuntuacion(5);
        setComentario('');
        // Recargar la página para ver los cambios rápidamente
        window.location.reload();
      } else {
        alert('Error al guardar la reseña.');
      }
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-4 pt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Encontrá un Comedor</h2>
          <p className="text-gray-600">
            {userId ? 'Usá tu ubicación o buscá por barrio.' : 'Buscá por barrio o registrate para usar el GPS.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filtro por barrio - disponible para todos */}
          <input
            type="text"
            value={barrioFiltro}
            onChange={(e) => setBarrioFiltro(e.target.value)}
            placeholder="Buscar por barrio..."
            className="p-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-400 flex-1"
          />
          {/* Solo para usuarios logueados */}
          {userId && (
            <>
              <select 
                value={radioKm} 
                onChange={(e) => setRadioKm(Number(e.target.value))}
                className="p-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-green-400 font-medium"
              >
                <option value={0}>Todos los comedores</option>
                <option value={2}>A menos de 2 km</option>
                <option value={5}>A menos de 5 km</option>
                <option value={10}>A menos de 10 km</option>
              </select>
              <button 
                onClick={handleObtenerUbicacion}
                disabled={buscandoUbicacion}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {buscandoUbicacion ? '📍 Buscando...' : '📍 Mi ubicación'}
              </button>
            </>
          )}
        </div>
      </div>

      <MapaComedores comedores={comedoresMostrar} userLocation={userLocation} />

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">
          Listado de Comedores {radioKm > 0 && `(A menos de ${radioKm} km)`}
        </h3>
        
        {comedoresMostrar.length === 0 && (
          <p className="text-center text-gray-500 mt-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
            No encontramos comedores con esos filtros o cupos disponibles por el momento.
          </p>
        )}

        {comedoresMostrar.map((comedor) => (
          <div key={comedor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-800">{comedor.nombre}</h3>
                  <div className="flex items-center text-yellow-500 text-sm font-bold bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-200">
                    ⭐ {calcularPromedioEstrellas(comedor.resena).toFixed(1)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {comedor.cbu_alias && (
                    <button
                      onClick={() => setDonacionModal(comedor)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg transition"
                    >
                      ❤️ Donar
                    </button>
                  )}
                  {comedor.distanciaKm !== undefined && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center">
                      {comedor.distanciaKm < 1 ? 'A cuadras' : `A ${comedor.distanciaKm.toFixed(1)} km`}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">📍 {comedor.barrio} {comedor.direccion && `- ${comedor.direccion}`}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{comedor.descripcion}</p>
                </div>
                <button
                  onClick={() => handleVerResenas(comedor)}
                  className="bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg transition ml-2 whitespace-nowrap"
                >
                  💬 Reseñas ({comedor.resena ? comedor.resena.length : 0})
                </button>
              </div>
              
              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cupos requeridos</h4>
                {comedor.requerimiento_comedor.length === 0 ? (
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
                        <button
                          onClick={() => handlePostular(req.id)}
                          disabled={postulando === req.id}
                          className="ml-2 text-xs bg-green-600 text-white font-bold py-1 px-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                        >
                          {postulando === req.id ? '...' : 'Anotarme'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Donación vía MultiMCP */}
      {donacionModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
          onClick={() => setDonacionModal(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">Apoyá a {donacionModal.nombre}</h2>
              <button onClick={() => setDonacionModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-gray-600 text-sm mb-4">Podés colaborar transfiriendo directamente a la cuenta del comedor:</p>
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg mb-6 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CBU / Alias</p>
              <p className="text-lg font-mono font-bold text-gray-800 select-all">{donacionModal.cbu_alias}</p>
            </div>
            <button 
              onClick={() => setDonacionModal(null)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-xl transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Reseñas */}
      {resenaModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
          onClick={() => setResenaModal(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800">Reseñas de {resenaModal.nombre}</h2>
              <button onClick={() => setResenaModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-4 mb-6">
              {!resenaModal.resena || resenaModal.resena.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay reseñas todavía.</p>
              ) : (
                resenaModal.resena.map((r) => (
                  <div key={r.id} className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <p className="text-amber-500 font-bold mb-1">{'⭐'.repeat(r.puntuacion)}</p>
                    <p className="text-sm text-gray-700">{r.comentario}</p>
                  </div>
                ))
              )}
            </div>

            {userRole === 'comensal' ? (
              <form onSubmit={handleDejarResena} className="border-t pt-4">
                <h3 className="font-bold text-sm mb-2 text-gray-800">Dejar una reseña</h3>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Puntuación (1-5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={puntuacion}
                    onChange={(e) => setPuntuacion(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-amber-500 font-bold">
                    {'⭐'.repeat(puntuacion)}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Comentario</label>
                  <textarea
                    required
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="¿Qué tal te pareció el comedor?"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl transition"
                >
                  Publicar reseña
                </button>
              </form>
            ) : (
              <div className="border-t pt-4">
                <p className="text-sm text-center text-gray-500 bg-gray-50 p-3 rounded-lg">
                  Solo los <b>comensales</b> registrados pueden publicar reseñas.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostulacionVoluntario;
