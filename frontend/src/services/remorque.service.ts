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

export type RemorqueResponse = {
  success: boolean;
  data: Remorque;
};

export type RemorquesResponse = {
  success: boolean;
  data: Remorque[];
};

export type DeleteRemorqueResponse = {
  success: boolean;
  message?: string;
};

export const getRemorques = async (): Promise<Remorque[]> => {
  const { data } = await apiClient.get<RemorquesResponse>("/remorques");
  return data.data || [];
};

export const getRemorqueById = async (id: string): Promise<Remorque> => {
  const { data } = await apiClient.get<RemorqueResponse>(`/remorques/${id}`);
  return data.data;
};

export const createRemorque = async (payload: RemorquePayload): Promise<Remorque> => {
  const { data } = await apiClient.post<RemorqueResponse>("/remorques", payload);
  return data.data;
};

export const updateRemorque = async (id: string, payload: RemorquePayload): Promise<Remorque> => {
  const { data } = await apiClient.put<RemorqueResponse>(`/remorques/${id}`, payload);
  return data.data;
};

export const deleteRemorque = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<DeleteRemorqueResponse>(`/remorques/${id}`);
  return { success: data.success };
};
