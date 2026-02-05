import { apiClient } from "../utils/apiClient";

export interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  limitAmount: number;
  spentAmount: number;
  percentage: number;
}

export const getBudgets = async (): Promise<Budget[]> => {
  return apiClient("/budgets");
};

export const createBudget = async (budget: { categoryId: number; amount: number }) => {
  return apiClient("/budgets", {
    method: "POST",
    body: JSON.stringify(budget),
  });
};

export const deleteBudget = async (id: number) => {
  return apiClient(`/budgets/${id}`, {
    method: "DELETE",
  });
};