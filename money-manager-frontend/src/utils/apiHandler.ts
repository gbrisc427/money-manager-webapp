export const handleResponse = async (response: Response) => {
  
  if (response.status === 403) {
    
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    
    window.location.href = "/";
    
    console.error("⛔ ERROR 403: Acceso denegado o sesión expirada. (Redirección desactivada por depuración)");
    throw new Error("Sesión expirada");
  }


  if (!response.ok) {
    const errorText = await response.text();
    try {
        const jsonError = JSON.parse(errorText);
        throw new Error(jsonError.message || errorText);
    } catch {
        throw new Error(errorText || `Error ${response.status}`);
    }
  }

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (err) {
    return { message: text };
  }
};