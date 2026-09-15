import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Utensils, Search, UserCircle, LogIn } from 'lucide-react';
import { supabase } from './supabaseClient';
import Auth from './pages/Auth';
import Perfil from './pages/Perfil';
import GestionComedor from './pages/GestionComedor';
import PostulacionVoluntario from './pages/PostulacionVoluntario';

// Tipos para TypeScript basados en nuestro esquema de Supabase
type Habilidad = {
  nombre: string;
};

type Requerimiento = {
  id: string;
  cantidad_necesaria: number;
  habilidad: Habilidad;
  // Para el MVP asumimos que faltan todos, luego calcularemos las colaboraciones confirmadas
};

type Comedor = {
  id: string;
  nombre: string;
  barrio: string;
  descripcion: string;
  requerimiento_comedor: Requerimiento[];
};

function Home() {
  const [comedores, setComedores] = useState<Comedor[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchComedores() {
      // Hacemos un JOIN a través de Supabase: Comedores -> Requerimientos -> Habilidades
      const { data, error } = await supabase
        .from('comedor')
        .select(`
          id, nombre, barrio, descripcion,
          requerimiento_comedor (
            id, cantidad_necesaria,
            habilidad ( nombre )
          )
        `);

      if (error) {
        console.error('Error cargando comedores:', error);
      } else {
        setComedores(data as unknown as Comedor[]);
      }
      setCargando(false);
    }
    fetchComedores();
  }, []);

  const comedoresFiltrados = comedores.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.barrio?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Comedores cerca de vos</h2>
      
      {/* Buscador */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center mb-6 focus-within:ring-2 focus-within:ring-green-400">
        <Search className="text-gray-400 ml-2" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre o barrio..." 
          className="w-full p-2 outline-none"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Listado de Comedores */}
      <div className="space-y-4">
        {cargando ? (
          <p className="text-center text-gray-500 mt-10">Cargando comedores...</p>
        ) : comedoresFiltrados.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No se encontraron comedores.</p>
        ) : (
          comedoresFiltrados.map((comedor) => (
            <div key={comedor.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{comedor.nombre}</h3>
                  <p className="text-sm text-gray-500">📍 {comedor.barrio}</p>
                </div>
                {comedor.requerimiento_comedor?.length > 0 && (
                  <span className="bg-coral-100 text-coral-600 text-xs font-semibold px-2 py-1 rounded-full">
                    Faltan voluntarios
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2 mb-4 line-clamp-2">{comedor.descripcion}</p>
              
              <div className="flex gap-2 flex-wrap">
                {comedor.requerimiento_comedor?.map((req) => (
                  <span key={req.id} className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full border border-green-200">
                    {req.habilidad.nombre} 0/{req.cantidad_necesaria}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/gestionar-comedor" element={<GestionComedor />} />
          <Route path="/colaborar" element={<PostulacionVoluntario />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
