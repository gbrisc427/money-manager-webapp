import { apiClient } from "../utils/apiClient";

export interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  userId: number;
}

export const getCategories = async (): Promise<Category[]> => {
  return apiClient("/categories", { method: "GET" });
};

export const createCategory = async (category: Omit<Category, "id" | "userId">): Promise<Category> => {
  return apiClient("/categories", {
    method: "POST",
    body: JSON.stringify(category),
  });
};

export const deleteCategory = async (id: number): Promise<void> => {
  return apiClient(`/categories/${id}`, { method: "DELETE" });
};