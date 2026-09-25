import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Habilidad {
  id: string;
  nombre: string;
}

interface RequerimientoForm {
  habilidad_id: string;
  cantidad_necesaria: number;
}

const GestionComedor: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [diasYHorarios, setDiasYHorarios] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cbuAlias, setCbuAlias] = useState(''); // Incorporado vía MultiMCP
  const [requerimientos, setRequerimientos] = useState<RequerimientoForm[]>([]);
  const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const cargarHabilidades = async () => {
      const { data } = await supabase.from('habilidad').select('id, nombre');
      if (data) setHabilidades(data);
    };
    cargarHabilidades();
  }, []);

  const agregarRequerimiento = () => {
    setRequerimientos([...requerimientos, { habilidad_id: habilidades[0]?.id ?? '', cantidad_necesaria: 1 }]);
  };

  const quitarRequerimiento = (index: number) => {
    setRequerimientos(requerimientos.filter((_, i) => i !== index));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No estás autenticado');

      // Geocodificar dirección con Nominatim antes de guardar
      // Validar que la dirección tenga al menos un número (la altura)
      if (!/\d/.test(direccion)) {
        throw new Error('La dirección debe incluir la altura (un número válido).');
      }
      
      // Buscar solo en CABA con addressdetails para validar que sea una calle real
      const queryGeocoding = encodeURIComponent(`${direccion}, Ciudad Autónoma de Buenos Aires, Argentina`);
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=ar&q=${queryGeocoding}&viewbox=-58.5312,-34.7052,-58.3341,-34.5272&bounded=1`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        throw new Error('No pudimos encontrar esta dirección en Capital Federal. Verificá que la calle y la altura sean correctos.');
      }

            // Validar estrictamente que sea una dirección de calle o edificio y no una estación/parque
      const addr = geoData[0].address || {};
      const clase = geoData[0].class;
      const validClasses = ['highway', 'place'];
      
      if (!validClasses.includes(clase) || !addr.road) {
        throw new Error('Esta dirección no fue reconocida como una calle válida (el mapa detectó una estación, parque o lugar inválido). Asegurate de poner el nombre exacto de la calle y su altura.');
      }

      // Extraer barrio automáticamente del resultado del mapa
      const numeroIngresado = direccion.match(/\d+/)?.[0] || '';
      const direccionOficial = `${addr.road} ${addr.house_number || numeroIngresado}`.trim();
      const barrioDetectado = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || 'Capital Federal';
      const latitud = parseFloat(geoData[0].lat);
      const longitud = parseFloat(geoData[0].lon);



      // Insertar comedor y recuperar el ID con .select()
      const { data: comedorData, error: comedorError } = await supabase
        .from('comedor')
        .insert([{ nombre, barrio: barrioDetectado, direccion: direccionOficial, dias_y_horarios: diasYHorarios, descripcion, cbu_alias: cbuAlias, usuario_id: user.id, latitud, longitud }])
        .select('id')
        .single();

      if (comedorError || !comedorData) throw comedorError ?? new Error('No se pudo crear el comedor');

      const comedorId = comedorData.id;

      // Insertar requerimientos de habilidades
      if (requerimientos.length > 0) {
        const { error: reqError } = await supabase
          .from('requerimiento_comedor')
          .insert(
            requerimientos.map((r) => ({
              comedor_id: comedorId,
              habilidad_id: r.habilidad_id,
              cantidad_necesaria: r.cantidad_necesaria,
            }))
          );
        if (reqError) throw reqError;
      }

      setSuccessMsg(`¡Comedor guardado con éxito! Se registró la dirección: "${direccionOficial}". Si no es correcta, podés corregirla desde Editar.`);
      setNombre('');
      setDescripcion('');
      setRequerimientos([]);
      setTimeout(() => navigate('/perfil'), 5000);
    } catch (error: any) {
      setErrorMsg(error.message ?? 'Error al guardar el comedor');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-green-800 mb-6">🍽️ Registrar mi Comedor</h2>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 border border-green-200">{successMsg}</div>
      )}

      <form onSubmit={handleGuardar} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Comedor *</label>
          <input
            required
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Comedor San Martín"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej: Av. Rivadavia 1234"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Días y horarios de atención</label>
          <input
            type="text"
            value={diasYHorarios}
            onChange={(e) => setDiasYHorarios(e.target.value)}
            placeholder="Ej: Lunes a Viernes de 12:00 a 14:00"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Contá un poco sobre el comedor, horarios, etc."
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none resize-none"
          />
        </div>

        {/* Agregado vía MultiMCP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CBU / Alias para donaciones (Opcional)</label>
          <input
            type="text"
            value={cbuAlias}
            onChange={(e) => setCbuAlias(e.target.value)}
            placeholder="Ej: comedor.esperanza.mp"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />
        </div>

        {/* Sección dinámica de requerimientos */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-3">Habilidades que necesitás</h3>

          <div className="space-y-3">
            {requerimientos.map((req, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <select
                  value={req.habilidad_id}
                  onChange={(e) =>
                    setRequerimientos(requerimientos.map((r, i) =>
                      i === index ? { ...r, habilidad_id: e.target.value } : r
                    ))
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-400 text-sm"
                >
                  {habilidades.map((h) => (
                    <option key={h.id} value={h.id}>{h.nombre}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={req.cantidad_necesaria}
                  onChange={(e) =>
                    setRequerimientos(requerimientos.map((r, i) =>
                      i === index ? { ...r, cantidad_necesaria: parseInt(e.target.value, 10) || 1 } : r
                    ))
                  }
                  className="w-20 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-400 text-sm text-center"
                />
                <button
                  type="button"
                  onClick={() => quitarRequerimiento(index)}
                  className="bg-red-100 text-red-600 hover:bg-red-200 font-bold py-2 px-3 rounded-lg text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarRequerimiento}
            disabled={habilidades.length === 0}
            className="mt-3 text-sm font-medium text-green-700 hover:text-green-800 border border-green-300 bg-green-50 hover:bg-green-100 py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            + Agregar Habilidad Requerida
          </button>
        </div>

        <button
          type="submit"
          disabled={guardando || !nombre.trim() || !direccion.trim() || !diasYHorarios.trim()}
          className="w-full bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {guardando ? 'Guardando...' : 'Guardar Comedor'}
        </button>
      </form>
    </div>
  );
};

export default GestionComedor;
