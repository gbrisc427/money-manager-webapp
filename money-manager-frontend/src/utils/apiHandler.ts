export const handleResponse = async (response: Response) => {
  
  if (response.status === 403) {
    
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    
    alert("OPPS! Tu sesión ha expirado.\n\nPor seguridad, debes volver a identificarte.");
    
    
    window.location.href = "/";
    
    
    throw new Error("Sesión expirada");
  }


  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error ${response.status}`);
  }


  const text = await response.text();
  return text ? JSON.parse(text) : {};
};