import { apiClient } from "./apiClient";

export type Pneu = {
  _id: string;
  camionId: string;
  position: string; 
  marque?: string;
  modele?: string;
  dateInstallation?: string;
  kmInstallation?: number;
  usure?: number; // percentage
  isDelete?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PneuPayload = Omit<Pneu, "_id" | "createdAt" | "updatedAt" | "isDelete">;

export const getPneus = async (): Promise<Pneu[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: Pneu[] }>("/pneus");
  return data.data || [];
};

export const getPneusAlertes = async (): Promise<Pneu[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: Pneu[] }>("/pneus/alertes");
  return data.data || [];
};

export const getPneusByCamion = async (camionId: string): Promise<Pneu[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: Pneu[] }>(`/pneus/camion/${camionId}`);
  return data.data || [];
};

export const getPneuById = async (id: string): Promise<Pneu> => {
  const { data } = await apiClient.get<{ success: boolean; data: Pneu }>(`/pneus/${id}`);
  return data.data;
};

export const calculerUsure = async (id: string): Promise<{ usure: number }> => {
  const { data } = await apiClient.get<{ success: boolean; data: { usure: number } }>(`/pneus/${id}/usure`);
  return data.data;
};

export const createPneu = async (payload: PneuPayload): Promise<Pneu> => {
  const { data } = await apiClient.post<{ success: boolean; data: Pneu }>("/pneus", payload);
  return data.data;
};

export const remplacerPneu = async (
  id: string,
  payload: { dateInstallation?: string; kmInstallation?: number }
): Promise<Pneu> => {
  const { data } = await apiClient.post<{ success: boolean; data: Pneu }>(`/pneus/${id}/remplacer`, payload);
  return data.data;
};

export const updatePneu = async (id: string, payload: PneuPayload): Promise<Pneu> => {
  const { data } = await apiClient.put<{ success: boolean; data: Pneu }>(`/pneus/${id}`, payload);
  return data.data;
};

export const deletePneu = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean; message?: string }>(`/pneus/${id}`);
  return { success: data.success };
};
