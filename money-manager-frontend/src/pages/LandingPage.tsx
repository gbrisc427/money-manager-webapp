import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "1.5rem",
      }}
    >
      <h1 style={{ fontSize: "3rem", margin: 0 }}>Money Manager</h1>
      <button
        onClick={() => navigate("/register")}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1.25rem",
          backgroundColor: "#0066cc",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
        }}
      >
        Ir al registro
      </button>
    </div>
  );
};

export default LandingPage;
