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
  const { data } = await apiClient.get<Camion[]>("/camions");
  return data;
};

export const getCamionById = async (id: string): Promise<Camion> => {
  const { data } = await apiClient.get<Camion>(`/camions/${id}`);
  return data;
};

export const createCamion = async (payload: CamionPayload): Promise<Camion> => {
  const { data } = await apiClient.post<Camion>("/camions", payload);
  return data;
};

export const updateCamion = async (id: string, payload: CamionPayload): Promise<Camion> => {
  const { data } = await apiClient.put<Camion>(`/camions/${id}`, payload);
  return data;
};

export const deleteCamion = async (id: string): Promise<{ success: boolean } | Camion> => {
  const { data } = await apiClient.delete<{ success: boolean } | Camion>(`/camions/${id}`);
  return data;
};

export const updateKilometrage = async (
  id: string,
  payload: { kilometrage: number }
): Promise<Camion> => {
  const { data } = await apiClient.patch<Camion>(`/camions/${id}/kilometrage`, payload);
  return data;
};
