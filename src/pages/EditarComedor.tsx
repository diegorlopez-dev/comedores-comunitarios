import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const EditarComedor: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [diasYHorarios, setDiasYHorarios] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cbuAlias, setCbuAlias] = useState('');
  const [comedorId, setComedorId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarComedor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data } = await supabase
        .from('comedor')
        .select('id, nombre, barrio, direccion, dias_y_horarios, descripcion, cbu_alias')
        .eq('usuario_id', user.id)
        .single();
      if (data) {
        setComedorId(data.id);
        setNombre(data.nombre || '');
        setDireccion(data.direccion || '');
        setDiasYHorarios(data.dias_y_horarios || '');
        setDescripcion(data.descripcion || '');
        setCbuAlias(data.cbu_alias || '');
      }
    };
    cargarComedor();
  }, [navigate]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (!comedorId) throw new Error('No se encontró el comedor.');

      // Geocodificar si la dirección fue completada
            // Validar que la dirección tenga al menos un número (la altura)
      if (!/\d/.test(direccion)) {
        throw new Error('La dirección debe incluir la altura (un número válido).');
      }
      // Validar y Geocodificar usando la API oficial del Gobierno de la Ciudad (USIG)
      const usigUrl = `https://servicios.usig.buenosaires.gob.ar/normalizar/?direccion=${encodeURIComponent(direccion)}&geocodificar=true`;
      const usigResponse = await fetch(usigUrl);
      const usigData = await usigResponse.json();

      if (!usigData.direccionesNormalizadas || usigData.direccionesNormalizadas.length === 0) {
        throw new Error('La dirección ingresada no existe en Capital Federal. Verificá que la calle y la altura sean correctas.');
      }

      // Buscar si alguna de las coincidencias es de CABA
      const cabaMatch = usigData.direccionesNormalizadas.find((d: any) => d.cod_partido === 'caba' || d.nombre_partido === 'CABA');
      if (!cabaMatch) {
        throw new Error('La dirección ingresada no pertenece a Capital Federal. Solo se aceptan comedores en CABA.');
      }

      if (cabaMatch.tipo !== 'calle_altura' || !cabaMatch.altura) {
        throw new Error('Tenés que ingresar una altura válida junto con la calle (ej: Av. Rivadavia 1234).');
      }

      const direccionOficial = cabaMatch.direccion.split(',')[0]; // "MANZANARES 2000"
      
      // Extraer coordenadas
      let latitud = parseFloat(cabaMatch.coordenadas?.y || '0');
      let longitud = parseFloat(cabaMatch.coordenadas?.x || '0');
      
      if (latitud === 0 || longitud === 0) {
        throw new Error('No se pudo obtener la ubicación exacta en el mapa.');
      }

      // Obtener el Barrio oficial de USIG
      const barrioUrl = `https://ws.usig.buenosaires.gob.ar/datos_utiles?calle=${encodeURIComponent(cabaMatch.nombre_calle)}&altura=${cabaMatch.altura}`;
      const barrioResponse = await fetch(barrioUrl);
      const barrioData = await barrioResponse.json();
      
      const barrioDetectado = barrioData.barrio || 'Capital Federal';

      const barrioDetectado = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || 'Capital Federal';
      let latitud = parseFloat(geoData[0].lat);
      let longitud = parseFloat(geoData[0].lon);

      const payload: Record<string, unknown> = {
        nombre,
        barrio: barrioDetectado,
        direccion,
        dias_y_horarios: diasYHorarios,
        descripcion,
        cbu_alias: cbuAlias,
      };
      if (latitud !== undefined) {
        payload.latitud = latitud;
        payload.longitud = longitud;
      }

      const { error } = await supabase.from('comedor').update(payload).eq('id', comedorId);
      if (error) throw error;
      setSuccessMsg(`¡Comedor actualizado con éxito! Se registró la dirección oficial: "${direccionOficial}".`);
      setTimeout(() => navigate('/perfil'), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">✏️ Editar Comedor</h1>
      {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{errorMsg}</div>}
      {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 border border-green-200">{successMsg}</div>}
      <form onSubmit={handleGuardar} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Comedor</label>
          <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Ej: Av. Rivadavia 1234" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Días y horarios de atención</label>
          <input type="text" value={diasYHorarios} onChange={e => setDiasYHorarios(e.target.value)} placeholder="Ej: Lunes a Viernes de 12:00 a 14:00" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CBU / Alias para Donaciones</label>
          <input type="text" value={cbuAlias} onChange={e => setCbuAlias(e.target.value)} placeholder="Ej: mi.alias o 0000003100..." className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={guardando} className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
            {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
          <button type="button" onClick={() => navigate('/perfil')} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarComedor;
