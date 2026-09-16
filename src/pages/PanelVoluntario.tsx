import React from 'react';

const PanelVoluntario: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 mt-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400/40 p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">🤝 Panel de Voluntario</h1>
        <p className="text-slate-700 mb-6">Tus postulaciones activas aparecerán aquí pronto.</p>
        
        <div className="bg-white p-6 rounded-xl border border-blue-200 text-center shadow-sm">
          <p className="text-gray-500 font-medium">No tenés ninguna postulación activa en este momento.</p>
          <a href="/" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition">
            Buscar Comedores
          </a>
        </div>
      </div>
    </div>
  );
};

export default PanelVoluntario;
