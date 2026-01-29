import { handleResponse } from "../utils/apiHandler";

export interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  userId: number;
}

const API_URL = "/api/categories";


export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
  });

  return handleResponse(response);
};

export const createCategory = async (category: Omit<Category, "id" | "userId">): Promise<Category> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
    body: JSON.stringify(category),
  });

  return handleResponse(response);
};

export const deleteCategory = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
        "Content-Type": "application/json" 
    },
    credentials: "include",
  });

  return handleResponse(response);
};