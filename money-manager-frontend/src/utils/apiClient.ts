import { handleResponse } from "./apiHandler";
import API_URL from "../config/api";

let isRefreshing = false;
let refreshPromise: Promise<Response> | null = null;

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
      
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = fetch(`${API_URL}/user/refresh-token`, {
          method: "POST",
          credentials: "include",
        }).then(res => {
          isRefreshing = false;
          return res;
        });
      }

      const refreshResponse = await refreshPromise;

      if (refreshResponse && refreshResponse.ok) {
        response = await fetch(url, config);
      }
    }
    
    return handleResponse(response);

  } catch (error) {
    throw error;
  }
};