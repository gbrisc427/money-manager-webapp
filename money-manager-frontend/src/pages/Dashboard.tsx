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
        {/* Título principal con degradado */}
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700">
          Bienvenido {profile?.name} al Dashboard
        </h1>
        <p className="mt-2 text-gray-900">
          Aquí podrás gestionar tu cuenta y ver tus datos.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
