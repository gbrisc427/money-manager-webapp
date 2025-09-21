import API_URL from "../config/api";

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
}

export async function registerUser(user: RegisterDTO) {
  const response = await fetch(`${API_URL}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const data = await response.text();
    throw new Error(data);
  }

  return await response.text();
}
