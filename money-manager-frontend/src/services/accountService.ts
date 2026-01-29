import { apiClient } from "../utils/apiClient";

export interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

export const getAccounts = async (): Promise<Account[]> => {
  return apiClient("/accounts", { method: "GET" });
};

export const createAccount = async (account: Omit<Account, "id">): Promise<Account> => {
  return apiClient("/accounts", {
    method: "POST",
    body: JSON.stringify(account),
  });
};

export const deleteAccount = async (id: number): Promise<void> => {
  return apiClient(`/accounts/${id}`, { method: "DELETE" });
};

export const getAccount = async (id: number): Promise<Account> => {
  return apiClient(`/accounts/${id}`, { method: "GET" });
};

export const updateAccount = async (id: number, account: Partial<Account>): Promise<Account> => {
  return apiClient(`/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(account),
  });
};