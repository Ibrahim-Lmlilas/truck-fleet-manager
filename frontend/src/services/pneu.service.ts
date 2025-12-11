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
  const { data } = await apiClient.get<Pneu[]>("/pneus");
  return data;
};

export const getPneusAlertes = async (): Promise<Pneu[]> => {
  const { data } = await apiClient.get<Pneu[]>("/pneus/alertes");
  return data;
};

export const getPneusByCamion = async (camionId: string): Promise<Pneu[]> => {
  const { data } = await apiClient.get<Pneu[]>(`/pneus/camion/${camionId}`);
  return data;
};

export const getPneuById = async (id: string): Promise<Pneu> => {
  const { data } = await apiClient.get<Pneu>(`/pneus/${id}`);
  return data;
};

export const calculerUsure = async (id: string): Promise<{ usure: number }> => {
  const { data } = await apiClient.get<{ usure: number }>(`/pneus/${id}/usure`);
  return data;
};

export const createPneu = async (payload: PneuPayload): Promise<Pneu> => {
  const { data } = await apiClient.post<Pneu>("/pneus", payload);
  return data;
};

export const remplacerPneu = async (
  id: string,
  payload: { dateInstallation?: string; kmInstallation?: number }
): Promise<Pneu> => {
  const { data } = await apiClient.post<Pneu>(`/pneus/${id}/remplacer`, payload);
  return data;
};

export const updatePneu = async (id: string, payload: PneuPayload): Promise<Pneu> => {
  const { data } = await apiClient.put<Pneu>(`/pneus/${id}`, payload);
  return data;
};

export const deletePneu = async (id: string): Promise<{ success: boolean } | Pneu> => {
  const { data } = await apiClient.delete<{ success: boolean } | Pneu>(`/pneus/${id}`);
  return data;
};
