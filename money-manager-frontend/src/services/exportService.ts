
export const downloadExcel = async (startDate?: string, endDate?: string) => {
  let url = "http://localhost:8081/api/export/excel";
  
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  if (params.toString()) url += `?${params.toString()}`;

  console.log("Iniciando descarga desde:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include" 
  });

  if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
          alert("Error de permisos (403/401). El backend no está leyendo la cookie correctamente o el token ha expirado.");
      } else {
          const errorText = await response.text();
          throw new Error(`Error del servidor (${response.status}): ${errorText}`);
      }
      return;
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `movimientos_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};