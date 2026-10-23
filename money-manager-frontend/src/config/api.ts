const rawUrl: string = import.meta.env.VITE_API_URL || "/api";
const cleanUrl = rawUrl.replace(/\/+$/, "");
const API_URL: string = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;

export default API_URL;
