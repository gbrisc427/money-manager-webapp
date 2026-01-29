import API_URL from "../config/api";

export interface LoginDTO {
  email: string;
  password: string;
}

export async function loginUser(credentials: LoginDTO) {
  const response = await fetch(`${API_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Credenciales incorrectas");
  }

  return await response.json(); 
}
