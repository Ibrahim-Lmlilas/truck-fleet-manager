import { apiClient } from "./apiClient";

export type Camion = {
  _id: string;
  matricule: string;
  marque?: string;
  modele?: string;
  annee?: number;
  kilometrage?: number;
  isDelete?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CamionPayload = {
  matricule: string;
  marque?: string;
  modele?: string;
  annee?: number;
  kilometrage?: number;
};

export const getCamions = async (): Promise<Camion[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: Camion[] }>("/camions");
  return data.data || [];
};

export const getCamionById = async (id: string): Promise<Camion> => {
  const { data } = await apiClient.get<{ success: boolean; data: Camion }>(`/camions/${id}`);
  return data.data;
};

export const createCamion = async (payload: CamionPayload): Promise<Camion> => {
  const { data } = await apiClient.post<{ success: boolean; data: Camion }>("/camions", payload);
  return data.data;
};

export const updateCamion = async (id: string, payload: CamionPayload): Promise<Camion> => {
  const { data } = await apiClient.put<{ success: boolean; data: Camion }>(`/camions/${id}`, payload);
  return data.data;
};

export const deleteCamion = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean; message?: string }>(`/camions/${id}`);
  return { success: data.success };
};

export const updateKilometrage = async (
  id: string,
  payload: { kilometrage: number }
): Promise<Camion> => {
  const { data } = await apiClient.patch<{ success: boolean; data: Camion }>(`/camions/${id}/kilometrage`, payload);
  return data.data;
};
