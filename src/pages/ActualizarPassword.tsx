import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ActualizarPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Al cargar, verificamos que haya una sesión.
    // Supabase automáticamente agarra el token de la URL y te "loguea" temporalmente
    // cuando hacés click en el link del mail.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsError(true);
        setMessage('El enlace de recuperación es inválido o ya expiró. Por favor, solicitá uno nuevo.');
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      setIsError(true);
      setMessage(`Error al actualizar: ${error.message}`);
    } else {
      setIsError(false);
      setMessage('¡Contraseña actualizada con éxito! Redirigiendo al inicio...');
      setTimeout(() => navigate('/'), 2500);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-green-800 text-center mb-6">Crear Nueva Contraseña</h2>
      
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
          <input 
            type="password" 
            required 
            minLength={6}
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
          <input 
            type="password" 
            required 
            minLength={6}
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500" 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !password || !confirmPassword || isError && !password}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
        </button>
        
        {message && (
          <p className={`text-center text-sm mt-4 font-medium p-3 rounded-lg ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default ActualizarPassword;
