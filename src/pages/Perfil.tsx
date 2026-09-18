import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Definición de interfaces para TypeScript
interface Rol {
  nombre: string;
}

interface UsuarioProfile {
  id: string;
  nombre?: string;
  email?: string;
  rol?: Rol | null;
  [key: string]: any;
}

export default function Perfil() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UsuarioProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [comedorExistente, setComedorExistente] = useState<{ id: string; nombre: string; barrio: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // 3. Obtener el usuario actual autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setAccessDenied(true);
          return;
        }

        // 4. Consultar la tabla 'usuario' vinculando la relación 'rol'
        const { data, error: profileError } = await supabase
          .from('usuario')
          .select('*, rol(nombre)')
          .eq('id', user.id)
          .single();

        if (profileError || !data) {
          console.error('Error al obtener perfil:', profileError);
          setAccessDenied(true);
        } else {
          setProfile(data as UsuarioProfile);
          // Si es referente, busca si ya tiene un comedor creado
          if (data.rol?.nombre === 'referente') {
            const { data: comedorData } = await supabase
              .from('comedor')
              .select('id, nombre, barrio')
              .eq('usuario_id', user.id)
              .single();
            if (comedorData) setComedorExistente(comedorData);
          }
        }
      } catch (error) {
        console.error('Error inesperado:', error);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Estado de Carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // 5. Mostrar mensaje si no hay usuario o hay error de acceso
  if (accessDenied || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
          <p className="text-slate-600 mb-6 text-sm">
            No se pudo verificar tu sesión o hubo un problema de sincronización.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition duration-200 shadow-md"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  // Comprobar rol
  const esReferente = profile.rol?.nombre?.toLowerCase() === 'referente';
  const esVoluntario = profile.rol?.nombre?.toLowerCase() === 'voluntario';

  // 6. Mostrar Dashboard básico
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Perfil del Usuario</h1>
            <p className="text-sm text-slate-500 mt-1">
              Bienvenido/a, <span className="font-semibold text-slate-700">{profile.nombre || profile.email || 'Usuario'}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-2 px-4 rounded-xl border border-red-200 transition"
          >
            Cerrar Sesión
          </button>
        </header>

        {/* Datos Personales */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3 border-slate-100">
            Tus Datos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rol en la Red</span>
              <p className="text-lg font-bold text-green-600 capitalize mt-1">
                {profile.rol?.nombre || 'Sin Rol'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</span>
              <p className="text-sm font-mono text-slate-600 truncate mt-1">
                {profile.email}
              </p>
            </div>
          </div>
        </section>

        {/* Panel exclusivo Referente */}
        {esReferente && (
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400/40 p-6 rounded-2xl shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-amber-900">🛠️ Panel Referente</h2>
            </div>

            {comedorExistente ? (
              <>
                <div className="bg-white p-4 rounded-xl border border-amber-200 mb-4">
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Tu Comedor</p>
                  <p className="text-lg font-bold text-amber-800">{comedorExistente.nombre}</p>
                  <p className="text-sm text-slate-500">📍 {comedorExistente.barrio}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/colaborar')}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-xl font-bold transition"
                  >
                    Ver Postulantes
                  </button>
                  <button
                    onClick={() => navigate('/editar-comedor')}
                    className="flex-1 bg-white border border-amber-400 text-amber-700 p-3 rounded-xl font-bold hover:bg-amber-50 transition"
                  >
                    ✏️ Editar Comedor
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-700 text-sm mb-6">Todavía no registraste tu comedor.</p>
                <button
                  onClick={() => navigate('/gestionar-comedor')}
                  className="w-full bg-white p-4 rounded-xl border border-amber-200 shadow-sm font-bold text-amber-700 hover:bg-amber-50"
                >
                  + Registrar mi Comedor
                </button>
              </>
            )}
          </section>
        )}

        {/* Panel exclusivo Voluntario */}
        {esVoluntario && (
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400/40 p-6 rounded-2xl shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-blue-900">
                🤝 Panel Voluntariado
              </h2>
            </div>
            <p className="text-slate-700 text-sm mb-6">
              Módulo habilitado únicamente para voluntarios.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/colaborar')}
                className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                Mis Postulaciones Activas
              </button>
              <button className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm font-bold text-blue-700 hover:bg-blue-50">
                Agregar mis Habilidades
              </button>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
