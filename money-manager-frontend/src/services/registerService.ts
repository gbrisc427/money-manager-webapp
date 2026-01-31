import { apiClient } from "../utils/apiClient";

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
}

export async function registerUser(user: RegisterDTO) {
  return apiClient("/user/register", {
    method: "POST",
    body: JSON.stringify(user),
  });
}