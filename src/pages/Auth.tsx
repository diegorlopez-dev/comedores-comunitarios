import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  
  // Campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('voluntario');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor, verificalas.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (loginData.session) {
          navigate('/perfil');
        }
      } else {
        // Supabase no devuelve error en signUp para emails duplicados cuando
        // la confirmación de email está activa — hay que chequearlo manualmente.
        const { data: existingUser } = await supabase
          .from('usuario')
          .select('id')
          .eq('email', email.toLowerCase().trim())
          .maybeSingle();

        if (existingUser) {
          throw new Error('Ese email ya está registrado. Por favor, iniciá sesión.');
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nombre, rol, telefono: (rol === 'voluntario' || rol === 'referente') ? telefono : null },
            emailRedirectTo: `${window.location.origin}/perfil`
          }
        });
        if (error) {
          if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
            throw new Error('Ese email ya está registrado. Por favor, iniciá sesión.');
          }
          throw error;
        }
        setRegistroExitoso(true);
      }
    } catch (error: any) {
      const msg: string = error.message || '';
      if (msg.includes('ya está registrado') || msg.includes('User already registered') || msg.includes('already been registered')) {
        setErrorMsg('Ese email ya está registrado. Por favor, iniciá sesión.');
      } else if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
        setErrorMsg('Email o contraseña incorrectos. Verificá tus datos.');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMsg('Tu email aún no fue confirmado. Revisá tu bandeja de entrada y hacé clic en el link que te enviamos.');
      } else if (msg.includes('Password should be at least')) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      } else if (msg.includes('Unable to validate email address')) {
        setErrorMsg('El formato del email no es válido.');
      } else if (msg.includes('rate limit') || msg.includes('too many requests')) {
        setErrorMsg('Demasiados intentos. Esperá unos minutos antes de intentar de nuevo.');
      } else {
        setErrorMsg('Ocurrió un error inesperado. Intentá de nuevo más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = isLogin 
    ? email.trim() !== '' && password.trim() !== ''
    : email.trim() !== '' && password.trim() !== '' && nombre.trim() !== '' && confirmPassword.trim() !== '' && password === confirmPassword;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">

      {registroExitoso ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-green-800 mb-3">¡Revisá tu email!</h2>
          <p className="text-gray-600 mb-6">Te enviamos un link de confirmación a <strong>{email}</strong>. Hacé clic en ese link para activar tu cuenta.</p>
          <button onClick={() => { setRegistroExitoso(false); setIsLogin(true); }} className="text-green-600 font-bold hover:underline">
            Ya confirmé, iniciar sesión →
          </button>
        </div>
      ) : (
      <>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y Apellido</label>
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
                <option value="comensal">Asistente/Comensal</option>
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
              onChange={e => {
                setPassword(e.target.value);
                if (confirmPassword) setPasswordsMatch(e.target.value === confirmPassword);
              }} 
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
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  setPasswordsMatch(e.target.value === password);
                }} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none pr-10" 
                minLength={6}
              />
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-xs mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
              </p>
            )}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading || !isFormValid} 
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
            setPasswordsMatch(null);
          }} 
          className="ml-1 text-green-600 font-bold hover:underline"
        >
          {isLogin ? "Registrate acá" : "Iniciá sesión"}
        </button>
      </div>
      </>
      )}
    </div>
  );
}
