import { apiClient } from "../utils/apiClient";

type MaybeJSON = Record<string, any> | string | null;

export const requestRecoveryCode = async (email: string): Promise<MaybeJSON> => {
  return apiClient(`/user/recover/request?email=${email}`, { method: "POST" });
};

export const verifyRecoveryCode = async (email: string, code: string): Promise<MaybeJSON> => {
  return apiClient(`/user/recover/verify?email=${email}&code=${code}`, { method: "POST" });
};

export const resetPassword = async (email: string, newPassword: string, code: string): Promise<MaybeJSON> => {
  return apiClient("/user/recover/reset", {
    method: "POST",
    body: JSON.stringify({ email, newPassword, code }),
  });
};