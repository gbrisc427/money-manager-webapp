import React, { useEffect, useState } from "react";
import { UserCircle } from "lucide-react";
import { getUserProfile } from "../services/profileService";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data); 
      } catch (err) {
        console.error("Error obteniendo perfil", err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#f9f9f6] p-6">
      <header className="flex items-center gap-2 justify-end">
         <UserCircle 
          className="w-10 h-10"
          stroke="url(#grad)" 
          onClick={() => navigate("/profile")}
        />
        <svg width="0" height="0">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
              <stop offset="50%" stopColor="#4f46e5" /> {/* indigo-600 */}
              <stop offset="100%" stopColor="#9333ea" /> {/* purple-700 */}
            </linearGradient>
          </defs>
        </svg>
      </header>
      <main className="mt-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700">
          Bienvenido {profile?.name} al Dashboard
        </h1>
        <p className="my-6 text-gray-900">
          Aquí podrás gestionar tu cuenta y ver tus datos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => navigate("/transactions")} 
            className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all group"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Movimientos</h3>
            </div>
            <p className="text-gray-500 text-sm">Registra gastos e ingresos y consulta tu historial.</p>
          </div>

          <div 
            onClick={() => navigate("/categories")} 
            className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Categorías</h3>
            </div>
            <p className="text-gray-500 text-sm">Organiza tus finanzas con etiquetas personalizadas.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
