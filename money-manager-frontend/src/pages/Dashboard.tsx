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
        if(profile?.name != null){
            localStorage.setItem("name", profile.name);
        }
      } catch (err) {
        console.error("Error obteniendo perfil", err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6">
      <header className="flex items-center gap-3">
        <UserCircle className="w-10 h-10 text-white" />
        <div
          className="text-white font-semibold cursor-pointer hover:underline"
          onClick={() => navigate("/profile")}
        >
          {profile ? profile.name || profile.email : "Cargando..."}
        </div>
      </header>
      <main className="mt-6 text-white">
        <h1 className="text-3xl font-bold">Bienvenido al Dashboard</h1>
        <p className="mt-2">Aquí podrás gestionar tu cuenta y ver tus datos.</p>
      </main>
    </div>
  );
};

export default Dashboard;
