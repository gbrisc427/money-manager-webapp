export interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

const API_URL = "/api/accounts";

const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

export const getAccounts = async (): Promise<Account[]> => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron cargar las cuentas`);
  }

  return response.json();
};


export const createAccount = async (account: Omit<Account, "id">): Promise<Account> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(account),
  });
  if (!response.ok) throw new Error("Error al crear cuenta");
  return response.json();
};

export const deleteAccount = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo eliminar la cuenta`);
  }
};

export const getAccount = async (id: number): Promise<Account> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error(`Error ${response.status}: No se pudo cargar la cuenta`);
  return response.json();
};

export const updateAccount = async (id: number, account: Partial<Account>): Promise<Account> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(account),
  });
  if (!response.ok) throw new Error(`Error ${response.status}: No se pudo actualizar la cuenta`);
  return response.json();
};