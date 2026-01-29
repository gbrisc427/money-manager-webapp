import { handleResponse } from "../utils/apiHandler";

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


export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
  });

  return handleResponse(response);
};

export const createTransaction = async (transaction: TransactionRequest): Promise<Transaction> => {
  
  const response = await fetch(API_URL, { 
    method: "POST",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
    body: JSON.stringify(transaction),
  });

  return handleResponse(response);
};

export const deleteTransaction = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
  });

  return handleResponse(response);
};

export const getTransactionsByAccount = async (accountId: number): Promise<Transaction[]> => {
  const response = await fetch(`${API_URL}/account/${accountId}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
  });

  return handleResponse(response);
};