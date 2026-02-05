import { apiClient } from "../utils/apiClient";

export interface UserProfile {
  name?: string;
  email?: string;
}

export async function getUserProfile(): Promise<UserProfile> {
  return apiClient("/user/profile", { method: "GET" }) as Promise<UserProfile>;
}

export async function updateUserName(newName: string) {
  return apiClient("/user/profile/name", {
    method: "PATCH",
    body: JSON.stringify({ newName }), 
  });
}

export const deleteUserAccount = async () => {
  return apiClient("/user/me", {
    method: "DELETE",
  });
};