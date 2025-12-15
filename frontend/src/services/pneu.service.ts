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

export type RemplacerPneuPayload = {
  dateInstallation?: string;
  kmInstallation?: number;
};

export type PneuResponse = {
  success: boolean;
  data: Pneu;
};

export type PneusResponse = {
  success: boolean;
  data: Pneu[];
};

export type UsureResponse = {
  success: boolean;
  data: { usure: number };
};

export type DeletePneuResponse = {
  success: boolean;
  message?: string;
};

export const getPneus = async (): Promise<Pneu[]> => {
  const { data } = await apiClient.get<PneusResponse>("/pneus");
  return data.data || [];
};

export const getPneusAlertes = async (): Promise<Pneu[]> => {
  const { data } = await apiClient.get<PneusResponse>("/pneus/alertes");
  return data.data || [];
};

export const getPneusByCamion = async (camionId: string): Promise<Pneu[]> => {
  const { data } = await apiClient.get<PneusResponse>(`/pneus/camion/${camionId}`);
  return data.data || [];
};

export const getPneuById = async (id: string): Promise<Pneu> => {
  const { data } = await apiClient.get<PneuResponse>(`/pneus/${id}`);
  return data.data;
};

export const calculerUsure = async (id: string): Promise<{ usure: number }> => {
  const { data } = await apiClient.get<UsureResponse>(`/pneus/${id}/usure`);
  return data.data;
};

export const createPneu = async (payload: PneuPayload): Promise<Pneu> => {
  const { data } = await apiClient.post<PneuResponse>("/pneus", payload);
  return data.data;
};

export const remplacerPneu = async (id: string, payload: RemplacerPneuPayload): Promise<Pneu> => {
  const { data } = await apiClient.post<PneuResponse>(`/pneus/${id}/remplacer`, payload);
  return data.data;
};

export const updatePneu = async (id: string, payload: PneuPayload): Promise<Pneu> => {
  const { data } = await apiClient.put<PneuResponse>(`/pneus/${id}`, payload);
  return data.data;
};

export const deletePneu = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<DeletePneuResponse>(`/pneus/${id}`);
  return { success: data.success };
};
