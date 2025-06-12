import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validate = (): string | null => {
    const { fullName, email, password } = formData;
    if (!fullName.trim()) return "El nombre completo es obligatorio.";
    if (!email.trim()) return "El correo electrónico es obligatorio.";
    if (!/\S+@\S+\.\S+/.test(email)) return "El correo electrónico no es válido.";
    if (!password.trim()) return "La contraseña es obligatoria.";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(password)) return "Debe contener al menos una mayúscula.";
    if (!/[a-z]/.test(password)) return "Debe contener al menos una minúscula.";
    if (!/\d/.test(password)) return "Debe contener al menos un número.";
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
      return "Debe contener al menos un símbolo.";
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type");
      let data: any;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error("Servidor respondió con HTML: " + text);
      }

      if (!response.ok) {
        throw new Error(data.message || "Error al registrar.");
      }

      // Si todo OK, redirige a /home
      navigate("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "1rem" }}>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {error && <div style={{ color: "red" }}>{error}</div>}

        <input
          type="text"
          name="fullName"
          placeholder="Nombre completo"
          value={formData.fullName}
          onChange={handleChange}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />

        <button
          type="submit"
          style={{
            padding: "0.75rem",
            fontSize: "1rem",
            backgroundColor: "#0066cc",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
