import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const RecuperarPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-password`,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setIsError(true);
    } else {
      setMessage('¡Listo! Te enviamos un correo con el enlace para recuperar tu contraseña.');
      setIsError(false);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-green-800 text-center mb-6">Recuperar Contraseña</h2>
      
      <p className="text-sm text-gray-600 mb-6 text-center">
        Ingresá el correo electrónico con el que te registraste y te enviaremos un enlace para crear una nueva contraseña.
      </p>

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500" 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !email}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>
        
        {message && (
          <p className={`text-center text-sm mt-4 font-medium p-3 rounded-lg ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {message}
          </p>
        )}
      </form>
      <div className="mt-6 text-center">
        <Link to="/login" className="text-green-600 hover:text-green-800 font-medium text-sm transition">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

export default RecuperarPassword;
