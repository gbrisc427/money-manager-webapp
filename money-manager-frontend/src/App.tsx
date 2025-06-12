import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RegisterForm from "./components/RegisterForm";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Redirige la raíz a /home */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Pantalla inicial /home */}
      <Route path="/home" element={<LandingPage />} />

      {/* Formulario de registro */}
      <Route path="/register" element={<RegisterForm />} />
    </Routes>
  </BrowserRouter>
);

export default App;
