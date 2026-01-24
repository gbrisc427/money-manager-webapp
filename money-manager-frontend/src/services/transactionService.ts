
export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  accountName?: string; 
  categoryId: string;   
}


export interface TransactionRequest {
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  accountId: number;
  categoryId: string; 
  date?: string;
}

const API_URL = "/api/transactions";


const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron cargar las transacciones`);
  }

  return response.json();
};

export const createTransaction = async (transaction: TransactionRequest): Promise<Transaction> => {
  const { accountId, ...bodyData } = transaction;

  const response = await fetch(`${API_URL}/new?accountId=${accountId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error ${response.status}: No se pudo crear la transacción`);
  }

  return response.json();
};

export const deleteTransaction = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo eliminar la transacción`);
  }
};