import { apiClient } from "../utils/apiClient";

export interface LoginDTO {
  email: string;
  password: string;
}

export async function loginUser(credentials: LoginDTO) {
  return apiClient("/user/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}