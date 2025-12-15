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

export type UpdateKilometragePayload = {
  kilometrage: number;
};

export type CamionResponse = {
  success: boolean;
  data: Camion;
};

export type CamionsResponse = {
  success: boolean;
  data: Camion[];
};

export type DeleteCamionResponse = {
  success: boolean;
  message?: string;
};

export const getCamions = async (): Promise<Camion[]> => {
  const { data } = await apiClient.get<CamionsResponse>("/camions");
  return data.data || [];
};

export const getCamionById = async (id: string): Promise<Camion> => {
  const { data } = await apiClient.get<CamionResponse>(`/camions/${id}`);
  return data.data;
};

export const createCamion = async (payload: CamionPayload): Promise<Camion> => {
  const { data } = await apiClient.post<CamionResponse>("/camions", payload);
  return data.data;
};

export const updateCamion = async (id: string, payload: CamionPayload): Promise<Camion> => {
  const { data } = await apiClient.put<CamionResponse>(`/camions/${id}`, payload);
  return data.data;
};

export const deleteCamion = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<DeleteCamionResponse>(`/camions/${id}`);
  return { success: data.success };
};

export const updateKilometrage = async (id: string, payload: UpdateKilometragePayload): Promise<Camion> => {
  const { data } = await apiClient.patch<CamionResponse>(`/camions/${id}/kilometrage`, payload);
  return data.data;
};
