import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Utensils, Search, UserCircle, LogIn } from 'lucide-react';
import { supabase } from './supabaseClient';
import Auth from './pages/Auth';
import Perfil from './pages/Perfil';
import GestionComedor from './pages/GestionComedor';
import DirectorioComedores from './pages/DirectorioComedores';
import PanelVoluntario from './pages/PanelVoluntario';
import EditarComedor from './pages/EditarComedor';

// Componentes de la aplicación

// El componente Home fue reemplazado por DirectorioComedores

import { useLocation } from 'react-router-dom';

function Layout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Header Dinámico */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto p-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Utensils className="text-green-600" />
            <h1 className="font-bold text-xl text-green-800">Red Solidaria</h1>
          </Link>
          {session ? (
            <Link to="/perfil" className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-800">
              <UserCircle size={18} /> Mi Perfil
            </Link>
          ) : (
            <Link to="/login" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-green-600">
              <LogIn size={18} /> Iniciar Sesión
            </Link>
          )}
        </div>
      </header>

      {/* Contenido Principal */}
      <main>
        {children}
      </main>

      {/* Navegación inferior Dinámica (Mobile) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-10">
        <div className="max-w-3xl mx-auto flex justify-around p-3">
          <Link to="/" className={`flex flex-col items-center ${path === '/' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}>
            <Search size={24} />
            <span className="text-xs mt-1 font-medium">Buscar</span>
          </Link>
          <Link to="/colaborar" className={`flex flex-col items-center ${path === '/colaborar' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}>
            <Utensils size={24} />
            <span className="text-xs mt-1 font-medium">Colaborar</span>
          </Link>
          <Link to="/perfil" className={`flex flex-col items-center ${path === '/perfil' || path === '/gestionar-comedor' || path === '/login' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}>
            <UserCircle size={24} />
            <span className="text-xs mt-1 font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DirectorioComedores />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/gestionar-comedor" element={<GestionComedor />} />
          <Route path="/editar-comedor" element={<EditarComedor />} />
          <Route path="/colaborar" element={<PanelVoluntario />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
