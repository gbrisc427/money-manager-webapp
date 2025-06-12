export const registerUser = async (userData: {
fullName: string;
email: string;
password: string;
}) => {
const response = await fetch("http://localhost:8080/api/user/register", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify(userData)
  });

  const contentType = response.headers.get("content-type");

  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error("Respuesta no válida del servidor: " + text);
  }

  if (!response.ok) {
    throw new Error(data.message || "Error al registrar.");
  }

  return data;
};
