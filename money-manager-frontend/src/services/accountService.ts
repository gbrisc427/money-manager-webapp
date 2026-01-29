import { handleResponse } from "../utils/apiHandler";

export interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

const API_URL = "/api/accounts";


export const getAccounts = async (): Promise<Account[]> => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
  });

  return handleResponse(response);
};


export const createAccount = async (account: Omit<Account, "id">): Promise<Account> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
    body: JSON.stringify(account),
  });
  return handleResponse(response);
};

export const deleteAccount = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
  });

  return handleResponse(response);
};

export const getAccount = async (id: number): Promise<Account> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
  });
  return handleResponse(response);
};

export const updateAccount = async (id: number, account: Partial<Account>): Promise<Account> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
    body: JSON.stringify(account),
  });
  return handleResponse(response);
};