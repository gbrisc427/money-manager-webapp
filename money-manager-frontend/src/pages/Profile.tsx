import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { LogOut } from "lucide-react";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<
    "main" | "requestCode" | "verifyCode" | "resetPassword"
  >("main");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Logout
  const handleLogout = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No autenticado");

    const response = await fetch("http://localhost:8081/api/user/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al cerrar sesión");

    // Limpiar localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");

    
    navigate("/");
  } catch (err: any) {
    console.error(err);
    alert(err.message || "Error al cerrar sesión");
  }
};
  // 🔹 Cargar perfil
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setMessage("No autenticado");
      return;
    }

    fetch("http://localhost:8081/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener perfil");
        return res.json();
      })
      .then((data) => {
        setEmail(data.email);
        setName(data.name);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userName", data.name);
      })
      .catch((err) => setMessage(err.message));
  }, []);

    // 🔹 Cambiar nombre
  const handleChangeName = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No autenticado");

      const response = await fetch(
        "http://localhost:8081/api/user/profile/name",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newName }),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar nombre");

      setName(newName);
      setMessage("Nombre actualizado correctamente");
      setNewName("");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  // 🔹 Paso 1: solicitar código
  const handleRequestCode = async () => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/user/recover/request?email=${email}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Error al solicitar código");
      setMessage("Código enviado al correo");
      setStep("verifyCode");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  // 🔹 Paso 2: verificar código
  const handleVerifyCode = async () => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/user/recover/verify?email=${email}&code=${code}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Código inválido o expirado");
      setMessage("Código verificado correctamente");
      setStep("resetPassword");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  // 🔹 Paso 3: resetear contraseña
  const handleResetPassword = async () => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/user/recover/reset?email=${email}&newPassword=${newPassword}`,
        { method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({email,newPassword}),
        }
      );
      if (!response.ok) throw new Error("Error al cambiar contraseña");
      setMessage("Contraseña actualizada correctamente");
      setStep("main");
      setCode("");
      setNewPassword("");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 px-4 relative">
      {/* 🔹 Botón Logout arriba a la derecha */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 flex items-center gap-2 text-white hover:text-gray-700 transition"
      >
        <span className="font-semibold">Logout</span>
        <LogOut size={20} />
        
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          {email}
        </h1>

        {step === "main" && (
          <div className="space-y-6">
            <p className="text-xl font-bold text-center text-indigo-700 mb-6">
              {name}
            </p>

            {/* Cambiar nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-00">
                Nuevo nombre
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Escribe tu nuevo nombre"
              />
              <button
                onClick={handleChangeName}
                className="mt-2 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
              >
                Actualizar nombre
              </button>
            </div>

            {/* Cambiar contraseña */}
            <div>
              <button
                onClick={() => setStep("requestCode")}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition duration-300"
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        )}

        {/* El resto de pasos de contraseña se quedan igual que los tenías */}
        {step === "requestCode" && (
          <div className="space-y-4">
            <p className="text-gray-700 text-center">
              Se enviará un código de verificación a tu correo
            </p>
            <button
              onClick={handleRequestCode}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
            >
              Solicitar código
            </button>
            <button
              onClick={() => setStep("main")}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition duration-300"
            >
              Cancelar
            </button>
          </div>
        )}

        {step === "verifyCode" && (
          <div className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Introduce el código recibido"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleVerifyCode}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
            >
              Verificar código
            </button>
            <button
              onClick={() => setStep("main")}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition duration-300"
            >
              Cancelar
            </button>
          </div>
        )}

        {step === "resetPassword" && (
          <div className="space-y-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 text-gray-500"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </button>
            <button
              onClick={handleResetPassword}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
            >
              Guardar nueva contraseña
            </button>
          </div>
        )}

        {message && (
          <p className="mt-4 text-center text-sm text-blue-600">{message}</p>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <span
            onClick={() => navigate("/dashboard")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Volver al Dashboard
          </span>
        </p>
      </div>
    </div>
  );
};

export default Profile;
