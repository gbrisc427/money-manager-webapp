import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white px-4">
     
      <h1 className="text-6xl font-extrabold mb-4 drop-shadow-lg">
        Money Manager
      </h1>

      <p className="text-lg mb-10 text-gray-200 text-center max-w-md">
        Controla tus ingresos, gastos y presupuestos de forma sencilla.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/register")}
          className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl shadow-md hover:bg-indigo-100 transition duration-300"
        >
          Crear cuenta
        </button>

        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-600 transition duration-300"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
