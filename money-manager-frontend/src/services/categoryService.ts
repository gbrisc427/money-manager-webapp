import { handleResponse } from "../utils/apiHandler";

export interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  userId: number;
}

const API_URL = "/api/categories";


const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

export const createCategory = async (category: Omit<Category, "id" | "userId">): Promise<Category> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(category),
  });

  return handleResponse(response);
};

export const deleteCategory = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return handleResponse(response);
};