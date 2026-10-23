import { apiClient } from "../utils/apiClient";

export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}

export const getGoals = async (): Promise<SavingsGoal[]> => {
  return apiClient("/goals");
};

export const createGoal = async (goal: Partial<SavingsGoal>) => {
  return apiClient("/goals", {
    method: "POST",
    body: JSON.stringify(goal),
  });
};

export const addFundsToGoal = async (id: number, amount: number) => {
  return apiClient(`/goals/${id}/add`, {
    method: "PUT",
    body: JSON.stringify({ amount }),
  });
};

export const deleteGoal = async (id: number) => {
  return apiClient(`/goals/${id}`, {
    method: "DELETE",
  });
};