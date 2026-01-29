import { handleResponse } from "./apiHandler";
import API_URL from "../config/api";

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include" as RequestCredentials, 
  };

  try {
    let response = await fetch(url, config);

    if (response.status === 403) {
      try {
        const refreshResponse = await fetch(`${API_URL}/user/refresh-token`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          response = await fetch(url, config);
        } else {
          throw new Error("Sesión caducada");
        }
      } catch (refreshError) {
        return handleResponse(response); 
      }
    }
    
    return handleResponse(response);

  } catch (error) {
    throw error;
  }
};