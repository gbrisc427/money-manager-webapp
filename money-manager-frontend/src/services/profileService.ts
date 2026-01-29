
import API_URL from "../config/api";

export interface UserProfile {
  name?: string;
  email?: string;
}

export async function getUserProfile(): Promise<UserProfile> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${API_URL}/user/profile`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    credentials: "include",
  });

 
  const raw = await res.text();
  const contentType = res.headers.get("content-type") || "";
  let body: any = null;

  if (contentType.includes("application/json")) {
    try {
      body = JSON.parse(raw);
    } catch (e) {
      // JSON inválido
      throw new Error(`INVALID_JSON:${raw}`);
    }
  } else {
    body = raw;
  }

  if (!res.ok) {
    const serverMessage =
      (body && (body.message || body.error || (typeof body === "string" ? body : null))) ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(serverMessage);
  }

  return body as UserProfile;
}