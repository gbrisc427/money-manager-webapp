export const handleResponse = async (response: Response) => {
  
  if (response.ok) {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (err) {
      return { message: text };
    }
  }

  const errorText = await response.text();
  let errorMessage = errorText; 

  try {
    const jsonError = JSON.parse(errorText);
    errorMessage = jsonError.message || jsonError.error || errorMessage;
  } catch (e) {
  }

  if (!errorMessage || errorMessage.trim() === "") {
    errorMessage = `Error ${response.status} (${response.statusText})`;
  }

  if (response.status === 403) {
    const isAuthRequest = 
        response.url.includes("/login") || 
        response.url.includes("/register") || 
        response.url.includes("/auth");

    if (!isAuthRequest) {
      console.error("⛔ Sesión expirada en ruta protegida.");
      
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      
      throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
    }
    
  }

  throw new Error(errorMessage);
};