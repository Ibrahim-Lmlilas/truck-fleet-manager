import { apiClient } from "./apiClient";

export type Remorque = {
  _id: string;
  matricule: string;
  type?: string;
  capacite?: number;
  isDelete?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RemorquePayload = {
  matricule: string;
  type?: string;
  capacite?: number;
};

export const getRemorques = async (): Promise<Remorque[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: Remorque[] }>("/remorques");
  return data.data || [];
};

export const getRemorqueById = async (id: string): Promise<Remorque> => {
  const { data } = await apiClient.get<{ success: boolean; data: Remorque }>(`/remorques/${id}`);
  return data.data;
};

export const createRemorque = async (payload: RemorquePayload): Promise<Remorque> => {
  const { data } = await apiClient.post<{ success: boolean; data: Remorque }>("/remorques", payload);
  return data.data;
};

export const updateRemorque = async (id: string, payload: RemorquePayload): Promise<Remorque> => {
  const { data } = await apiClient.put<{ success: boolean; data: Remorque }>(`/remorques/${id}`, payload);
  return data.data;
};

export const deleteRemorque = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean; message?: string }>(`/remorques/${id}`);
  return { success: data.success };
};
