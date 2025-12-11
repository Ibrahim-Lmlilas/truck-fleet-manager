import { apiClient } from "./apiClient";

export type Pneu = {
  _id: string;
  reference: string;
  camion: string | {
    _id: string;
    matricule: string;
    marque?: string;
    modele?: string;
    kilometrage?: number;
  };
  position: string; 
  kmPose: number;
  kmMax: number;
  statut: "bon" | "usé" | "à remplacer" | "remplacé";
  dateRemplacement?: string;
  prix?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PneuPayload = {
  reference: string;
  camion: string;
  position: string;
  kmPose: number;
  kmMax?: number;
  statut?: "bon" | "usé" | "à remplacer" | "remplacé";
  prix?: number;
};

export type RemplacementPayload = {
  nouveauPneu: {
    reference: string;
    kmPose?: number;
    prix?: number;
    kmMax?: number;
  };
};

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

export const calculerUsure = async (id: string): Promise<{
  pneu: { id: string; reference: string; position: string; statut: string };
  camion: { matricule: string; kilometrageActuel: number };
  usure: {
    kmPose: number;
    kmMax: number;
    kmParcouru: number;
    kmRestant: number;
    pourcentageUsure: number;
  };
  alerte?: string;
}> => {
  const { data } = await apiClient.get<{ success: boolean; data: {
    pneu: { id: string; reference: string; position: string; statut: string };
    camion: { matricule: string; kilometrageActuel: number };
    usure: {
      kmPose: number;
      kmMax: number;
      kmParcouru: number;
      kmRestant: number;
      pourcentageUsure: number;
    };
    alerte?: string;
  } }>(`/pneus/${id}/usure`);
  return data.data;
};

export const createPneu = async (payload: PneuPayload): Promise<Pneu> => {
  const { data } = await apiClient.post<{ success: boolean; data: Pneu }>("/pneus", payload);
  return data.data;
};

export const remplacerPneu = async (
  id: string,
  payload: RemplacementPayload
): Promise<{ ancienPneu: Pneu; nouveauPneu: Pneu }> => {
  const { data } = await apiClient.post<{ success: boolean; data: { ancienPneu: Pneu; nouveauPneu: Pneu } }>(`/pneus/${id}/remplacer`, payload);
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
