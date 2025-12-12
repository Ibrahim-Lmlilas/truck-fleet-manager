import { apiClient } from "./apiClient";

export type Trajet = {
  _id: string;
  camion?: string; // camion ID
  chauffeur?: string; // user ID
  depart?: string;
  destination?: string;
  dateDepart?: string;
  dateArrivee?: string | null;
  statut?: "planifie" | "en_cours" | "termine" | "annule";
  kmDepart?: number;
  kmArrivee?: number | null;
  gasoil?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TrajetPayload = Omit<Trajet, "_id" | "createdAt" | "updatedAt">;

export const getTrajets = async (): Promise<Trajet[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: Trajet[] }>("/trajets");
  return data.data || [];
};

export const getTrajetById = async (id: string): Promise<Trajet> => {
  const { data } = await apiClient.get<{ success: boolean; data: Trajet }>(`/trajets/${id}`);
  return data.data;
};

export const createTrajet = async (payload: TrajetPayload): Promise<Trajet> => {
  const { data } = await apiClient.post<{ success: boolean; data: Trajet }>("/trajets", payload);
  return data.data;
};

export const updateTrajet = async (id: string, payload: TrajetPayload): Promise<Trajet> => {
  const { data } = await apiClient.put<{ success: boolean; data: Trajet }>(`/trajets/${id}`, payload);
  return data.data;
};

export const updateStatut = async (
  id: string,
  payload: { statut: Trajet["statut"] }
): Promise<Trajet> => {
  const { data } = await apiClient.patch<{ success: boolean; data: Trajet }>(`/trajets/${id}/statut`, payload);
  return data.data;
};

export const updateKmEtGasoil = async (
  id: string,
  payload: { kmArrivee?: number; gasoil?: number }
): Promise<Trajet> => {
  const { data } = await apiClient.patch<{ success: boolean; data: Trajet }>(`/trajets/${id}/km-gasoil`, payload);
  return data.data;
};

export const deleteTrajet = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean; message?: string }>(`/trajets/${id}`);
  return { success: data.success };
};

export const getTrajetPDF = async (id: string): Promise<Blob> => {
  const response = await apiClient.get(`/trajets/${id}/pdf`, { 
    responseType: "blob" 
  });
  return response.data as Blob;
};
