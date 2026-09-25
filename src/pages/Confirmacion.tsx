import React from 'react';
import { MailCheck } from 'lucide-react';

const Confirmacion: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-green-50 p-6 rounded-full mb-6 border-4 border-green-100">
        <MailCheck size={64} className="text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        ¡Email validado con éxito!
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Su correo electrónico ha sido autenticado correctamente. 
        Ya puede cerrar esta pestaña y volver a la aplicación original para iniciar sesión.
      </p>
      <button 
        onClick={() => window.close()}
        className="bg-gray-800 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-900 transition"
      >
        Cerrar pestaña
      </button>
    </div>
  );
};

export default Confirmacion;
