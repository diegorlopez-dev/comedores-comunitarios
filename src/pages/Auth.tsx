import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  // Campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('voluntario');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Validación de contraseñas para registro
    if (!isLogin && password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor, verificalas.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/perfil');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre,
              rol
            }
          }
        });
        if (error) throw error;
        
        alert('¡Registro exitoso! Ya puedes iniciar sesión con tus datos.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      // Traducir algunos errores comunes
      if (error.message.includes('User already registered')) {
        setErrorMsg('Ese email ya está registrado. Por favor, iniciá sesión.');
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">
        {isLogin ? 'Iniciar Sesión' : 'Unirse a la Red Solidaria'}
      </h2>
      
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input 
                required 
                type="text" 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo querés participar?</label>
              <select 
                value={rol} 
                onChange={e => setRol(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
              >
                <option value="comensal">Solo quiero encontrar comedores cercanos</option>
                <option value="voluntario">Quiero ser Voluntario</option>
                <option value="referente">Soy Referente de un Comedor</option>
              </select>
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            required 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <div className="relative">
            <input 
              required 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none pr-10" 
              minLength={6}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repetir Contraseña</label>
            <div className="relative">
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none pr-10" 
                minLength={6}
              />
              {/* Opcional: el mismo botón de ver contraseña podría afectar a ambos o tener uno propio */}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 mt-4 transition-colors"
        >
          {isLoading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarme')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        {isLogin ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}
        <button 
          onClick={() => { 
            setIsLogin(!isLogin); 
            setErrorMsg('');
            setPassword('');
            setConfirmPassword('');
          }} 
          className="ml-1 text-green-600 font-bold hover:underline"
        >
          {isLogin ? "Registrate acá" : "Iniciá sesión"}
        </button>
      </div>
    </div>
  );
}
