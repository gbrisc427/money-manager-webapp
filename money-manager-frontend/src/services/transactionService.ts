
export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  accountName?: string;
  categoryId: number; 
}

export interface TransactionRequest {
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  accountId: number;
  categoryId: number; 
  date?: string;
}

const API_URL = "/api/transactions";

const getHeaders = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
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
  
  const response = await fetch(API_URL, { 
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
        throw new Error(errorText); 
    } catch {
        throw new Error(`Error ${response.status}: ${errorText || 'Falló la creación'}`);
    }
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

export const getTransactionsByAccount = async (accountId: number): Promise<Transaction[]> => {
  const response = await fetch(`${API_URL}/account/${accountId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudieron cargar los movimientos de la cuenta`);
  }

  return response.json();
};