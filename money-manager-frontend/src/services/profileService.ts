import { apiClient } from "../utils/apiClient";

export interface UserProfile {
  name?: string;
  email?: string;
}

export async function getUserProfile(): Promise<UserProfile> {
  // apiClient maneja internamente la lectura de la respuesta JSON
  return apiClient("/user/profile", { method: "GET" }) as Promise<UserProfile>;
}