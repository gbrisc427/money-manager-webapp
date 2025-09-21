import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"main" | "requestCode" | "resetPassword">(
    "main"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    setEmail(storedEmail);

    if (storedEmail) {
      fetch(`http://localhost:8081/api/user/profile?email=${storedEmail}`)
        .then((res) => {
          if (!res.ok) throw new Error("Error al obtener perfil");
          return res.json();
        })
        .then((data) => {
          setName(data.name);
        })
        .catch((err) => setMessage(err.message));
    }
  }, []);

  // 🔹 Cambiar nombre
  const handleChangeName = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/user/update-name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newName }),
      });
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
      setStep("resetPassword");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  // 🔹 Paso 2: resetear contraseña
  const handleResetPassword = async () => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/user/recover/reset?email=${email}&newPassword=${newPassword}&code=${code}`,
        { method: "POST" }
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          {email}
        </h1>

        {step === "main" && (
          <div className="space-y-6">
            <p className="text-gray-700 text-center">
              <strong>Nombre:</strong> {name}
            </p>

            {/* Cambiar nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
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

        {step === "resetPassword" && (
          <div className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código recibido por correo"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
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
