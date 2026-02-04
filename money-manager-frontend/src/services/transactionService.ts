import { apiClient } from "../utils/apiClient";

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

export interface CategoryStat {
  categoryName: string;
  color: string;
  totalAmount: number;
}

export interface MonthlyStat {
  month: string;
  income: number;
  expense: number;
}

export const getTransactions = async (): Promise<Transaction[]> => {
  return apiClient("/transactions", { method: "GET" });
};

export const createTransaction = async (transaction: TransactionRequest): Promise<Transaction> => {
  return apiClient("/transactions", { 
    method: "POST",
    body: JSON.stringify(transaction),
  });
};

export const deleteTransaction = async (id: number): Promise<void> => {
  return apiClient(`/transactions/${id}`, { method: "DELETE" });
};

export const getTransactionsByAccount = async (accountId: number): Promise<Transaction[]> => {
  return apiClient(`/transactions/account/${accountId}`, { method: "GET" });
};

export const getCategoryStats = async (): Promise<CategoryStat[]> => {
  return apiClient("/transactions/stats/categories", { method: "GET" });
};

export const getMonthlyStats = async (): Promise<MonthlyStat[]> => {
  return apiClient("/transactions/stats/monthly", { method: "GET" });
};