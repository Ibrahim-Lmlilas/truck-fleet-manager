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
  const { data } = await apiClient.get<Remorque[]>("/remorques");
  return data;
};

export const getRemorqueById = async (id: string): Promise<Remorque> => {
  const { data } = await apiClient.get<Remorque>(`/remorques/${id}`);
  return data;
};

export const createRemorque = async (payload: RemorquePayload): Promise<Remorque> => {
  const { data } = await apiClient.post<Remorque>("/remorques", payload);
  return data;
};

export const updateRemorque = async (id: string, payload: RemorquePayload): Promise<Remorque> => {
  const { data } = await apiClient.put<Remorque>(`/remorques/${id}`, payload);
  return data;
};

export const deleteRemorque = async (id: string): Promise<{ success: boolean } | Remorque> => {
  const { data } = await apiClient.delete<{ success: boolean } | Remorque>(`/remorques/${id}`);
  return data;
};
