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

interface Comedor extends ComedorMapa {
  descripcion: string;
  direccion: string;
  cbu_alias: string | null;
  requerimiento_comedor: Requerimiento[];
  distanciaKm?: number;
}

const PostulacionVoluntario: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [comedoresOriginales, setComedoresOriginales] = useState<Comedor[]>([]);
  const [comedoresMostrar, setComedoresMostrar] = useState<Comedor[]>([]);
  const [postulando, setPostulando] = useState<string | null>(null);
  const [donacionModal, setDonacionModal] = useState<Comedor | null>(null); // Añadido vía MultiMCP
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [radioKm, setRadioKm] = useState<number>(0); // 0 = sin límite

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
        .select('id, nombre, barrio, direccion, descripcion, cbu_alias, latitud, longitud, requerimiento_comedor(id, cantidad_necesaria, habilidad(id, nombre))');
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
  }, [userLocation, radioKm, comedoresOriginales]);

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

  return (
    <div className="max-w-4xl mx-auto p-4 pt-6 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-green-800">🤝 Encontrá un Comedor</h2>
          <p className="text-gray-600">Buscá comedores cerca tuyo y postulate como voluntario.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
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
            {buscandoUbicacion ? '📍 Buscando...' : '📍 Usar mi ubicación'}
          </button>
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
                <h3 className="text-lg font-bold text-gray-800">{comedor.nombre}</h3>
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
              
              <p className="text-sm text-gray-500">📍 {comedor.barrio} {comedor.direccion && `- ${comedor.direccion}`}</p>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{comedor.descripcion}</p>
              
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
    </div>
  );
};

export default PostulacionVoluntario;
