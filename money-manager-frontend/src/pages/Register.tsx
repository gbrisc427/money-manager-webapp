import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/registerService";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";


const Register: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados de validación en tiempo real
  const [passwordValid, setPasswordValid] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Estados para mostrar/ocultar
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🔹 Validación de contraseña
  const validatePassword = (pwd: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return regex.test(pwd);
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    setPasswordValid(validatePassword(pwd));
    setPasswordsMatch(pwd === confirmPassword);
  };

  const handleConfirmPasswordChange = (confirm: string) => {
    setConfirmPassword(confirm);
    setPasswordsMatch(password === confirm);
  };

  // 🔹 Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!passwordValid) {
      setError("La contraseña no cumple los requisitos");
      return;
    }

    if (!passwordsMatch) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await registerUser({ fullName, email, password });
      setSuccess("Registro exitoso. Puedes iniciar sesión.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.message || "Error al registrar");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Crear cuenta
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Tu nombre"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="ejemplo@correo.com"
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                passwordValid
                  ? "focus:ring-indigo-500 border-gray-300"
                  : "focus:ring-red-500 border-red-500"
              }`}
              placeholder="********"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
              
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
            {!passwordValid && (
              <p className="text-xs text-red-500 mt-1">
                La contraseña debe tener al menos 8 caracteres, una mayúscula,
                minúscula, un número y un símbolo
              </p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) =>
                handleConfirmPasswordChange(e.target.value)
              }
              required
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                passwordsMatch
                  ? "focus:ring-indigo-500 border-gray-300"
                  : "focus:ring-red-500 border-red-500"
              }`}
              placeholder="********"
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-9 text-gray-500"
            >
              {showConfirmPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible  size={20} />}
            </button>
            {!passwordsMatch && (
              <p className="text-xs text-red-500 mt-1">
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
          >
            Registrarse
          </button>
        </form>

        {/* Mensajes */}
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="mt-4 text-center text-sm text-green-600">{success}</p>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:underline cursor-pointer"
          >
            Inicia sesión aquí
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
