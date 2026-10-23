import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "blue" | "success" | "danger";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, { idle: string; loading: string }> = {
  primary: {
    idle: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
    loading: "bg-indigo-900 text-indigo-100 shadow-none",
  },
  blue: {
    idle: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200",
    loading: "bg-blue-900 text-blue-100 shadow-none",
  },
  success: {
    idle: "bg-green-600 text-white hover:bg-green-700 shadow-green-200",
    loading: "bg-green-900 text-green-100 shadow-none",
  },
  danger: {
    idle: "bg-red-600 text-white hover:bg-red-700 shadow-red-200",
    loading: "bg-red-900 text-red-100 shadow-none",
  },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  loadingText = "Cargando...",
  variant = "primary",
  fullWidth = true,
  disabled,
  className = "",
  ...props
}) => {
  const isBlocked = isLoading || disabled;
  const currentVariant = variantClasses[variant];

  return (
    <button
      disabled={isBlocked}
      aria-busy={isLoading}
      className={`
        ${fullWidth ? "w-full" : ""}
        ${isLoading ? currentVariant.loading : currentVariant.idle}
        ${isBlocked ? "cursor-not-allowed opacity-85" : ""}
        flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 select-none
        ${className}
      `.trim()}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin shrink-0" size={18} />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
