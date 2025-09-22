import API_URL from "../config/api";

type MaybeJSON = Record<string, any> | string | null;

export const requestRecoveryCode = async (email: string): Promise<MaybeJSON> => {
  const res = await fetch(`${API_URL}/user/recover/request?email=${email}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error al solicitar código");
  return res.text();
};

export const verifyRecoveryCode = async (email: string, code: string): Promise<MaybeJSON> => {
  const res = await fetch(`${API_URL}/user/recover/verify?email=${email}&code=${code}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Código inválido o expirado");
  return res.text();
};

export const resetPassword = async (email: string, newPassword: string, code: string): Promise<MaybeJSON> => {
  const res = await fetch(`${API_URL}/user/recover/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword, code }),
  });
  if (!res.ok) throw new Error("Error al cambiar contraseña");
  return res.text();
};
