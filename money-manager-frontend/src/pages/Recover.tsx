import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestRecoveryCode, verifyRecoveryCode, resetPassword } from "../services/recoverService";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Recover: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"requestCode" | "verifyCode" | "resetPassword">("requestCode");
  const [message, setMessage] = useState("");

  const handleRequestCode = async () => {
    try {
      await requestRecoveryCode(email);
      setMessage("Código enviado al correo");
      setStep("verifyCode");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await verifyRecoveryCode(email, code);
      setMessage("Código verificado correctamente");
      setStep("resetPassword");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(email, code, newPassword);
      setMessage("Contraseña actualizada correctamente");
      setStep("requestCode");
      setEmail("");
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
          Recuperar Contraseña
        </h1>

        {step === "requestCode" && (
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleRequestCode}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
            >
              Solicitar código
            </button>
          </div>
        )}

        {step === "verifyCode" && (
          <div className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código recibido"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleVerifyCode}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
            >
              Verificar código
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
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
            </button>
            <button
              onClick={handleResetPassword}
              className="w-full mt-12 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-300"
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
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Volver al login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Recover;
