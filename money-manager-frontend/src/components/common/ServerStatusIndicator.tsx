import React from "react";
import type { BackendStatus } from "../../hooks/useBackendWakeup";

interface ServerStatusIndicatorProps {
  status: BackendStatus;
}

export const ServerStatusIndicator: React.FC<ServerStatusIndicatorProps> = ({ status }) => {
  if (status === "idle") {
    return null;
  }

  const config = {
    waking: {
      containerClass: "bg-amber-50/95 border-amber-200 text-amber-800",
      dotClass: "bg-amber-500 animate-ping",
      solidDotClass: "bg-amber-500",
      label: "Conectando con el servidor...",
    },
    ready: {
      containerClass: "bg-emerald-50/95 border-emerald-200 text-emerald-800",
      dotClass: "bg-emerald-500",
      solidDotClass: "bg-emerald-500",
      label: "Servidor conectado",
    },
    error: {
      containerClass: "bg-red-50/95 border-red-200 text-red-800",
      dotClass: "bg-red-500",
      solidDotClass: "bg-red-500",
      label: "Servidor sin respuesta",
    },
  }[status];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300"
    >
      <div
        className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border shadow-sm backdrop-blur-sm text-xs font-semibold ${config.containerClass}`}
      >
        <span className="relative flex h-2 w-2">
          {status === "waking" && (
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${config.solidDotClass}`}
          />
        </span>
        <span>{config.label}</span>
      </div>
    </div>
  );
};

export default ServerStatusIndicator;
