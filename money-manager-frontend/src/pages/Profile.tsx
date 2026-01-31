import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { LogOut, User, ArrowLeft } from "lucide-react";
import { getUserProfile, updateUserName } from "../services/profileService";
import { logoutUser } from "../services/authService";
import { requestRecoveryCode, verifyRecoveryCode, resetPassword } from "../services/recoverService";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState("");
  const [newName, setNewName] = useState("");
  
  // Estados para recuperación de contraseña
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"main" | "requestCode" | "verifyCode" | "resetPassword">("main");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile();
        setEmail(data.email || "");
        setName(data.name || "");
        if (data.email) localStorage.setItem("userEmail", data.email);
        if (data.name) localStorage.setItem("userName", data.name);
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      navigate("/login");
    }
  };

  const handleChangeName = async () => {
    try {
      if (!newName.trim()) return;
      await updateUserName(newName);
      setName(newName);
      localStorage.setItem("userName", newName);
      setMessage("Nombre actualizado correctamente");
      setIsError(false);
      setNewName("");
    } catch (err: any) {
      setMessage(err.message || "Error al actualizar nombre");
      setIsError(true);
    }
  };

  const handleRequestCode = async () => {
    try {
      await requestRecoveryCode(email);
      setMessage("Código enviado al correo");
      setIsError(false);
      setStep("verifyCode");
    } catch (err: any) {
      setMessage(err.message || "Error al solicitar código");
      setIsError(true);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifyRecoveryCode(email, code);
      setMessage("Código verificado. Introduce tu nueva contraseña.");
      setIsError(false);
      setStep("resetPassword");
    } catch (err: any) {
      setMessage(err.message || "Código incorrecto");
      setIsError(true);
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(email, newPassword, code);
      setMessage("Contraseña actualizada con éxito");
      setIsError(false);
      setStep("main");
      setCode("");
      setNewPassword("");
    } catch (err: any) {
      setMessage(err.message || "Error al cambiar contraseña");
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f6] p-6">
      
      {/* HEADER CORREGIDO: Eliminado 'max-w-5xl mx-auto' para que ocupe todo el ancho */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="text-indigo-600" /> Mi Perfil
            </h2>
        </div>

        <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-gray-100"
        >
            <span className="font-semibold text-sm hidden sm:inline">Cerrar Sesión</span>
            <LogOut size={18} />
        </button>
      </header>

      {/* CONTENIDO CENTRADO: Mantiene su propio centrado independiente del header */}
      <div className="max-w-md mx-auto mt-10">
         <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                    <User size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">{name || "Usuario"}</h1>
                <p className="text-gray-500">{email}</p>
            </div>

            {step === "main" && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Cambiar Nombre
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Nuevo nombre"
                    />
                    <button
                      onClick={handleChangeName}
                      disabled={!newName.trim()}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Guardar
                    </button>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <div>
                  <button
                    onClick={() => setStep("requestCode")}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition"
                  >
                    Cambiar contraseña
                  </button>
                </div>
              </div>
            )}

            {step === "requestCode" && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-center text-gray-700">Verificación de Seguridad</h3>
                <p className="text-sm text-gray-500 text-center">
                  Para cambiar tu contraseña, primero enviaremos un código a <b>{email}</b>.
                </p>
                <div className="flex gap-3 pt-2">
                    <button onClick={() => { setStep("main"); setMessage(""); }} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleRequestCode} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Enviar Código</button>
                </div>
              </div>
            )}

            {step === "verifyCode" && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-center text-gray-700">Introduce el Código</h3>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ej: 123456"
                  className="w-full text-center tracking-widest text-xl px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="flex gap-3">
                    <button onClick={() => setStep("main")} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleVerifyCode} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Verificar</button>
                </div>
              </div>
            )}

            {step === "resetPassword" && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold text-center text-gray-700">Nueva Contraseña</h3>
                <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                    </button>
                </div>
                <button
                  onClick={handleResetPassword}
                  className="w-full bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition"
                >
                  Confirmar Cambio
                </button>
              </div>
            )}

            {message && (
              <div className={`mt-6 p-3 rounded-lg text-center text-sm ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {message}
              </div>
            )}

         </div>
      </div>
    </div>
  );
};

export default Profile;