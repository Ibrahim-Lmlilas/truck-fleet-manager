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
  const { data } = await apiClient.get<Trajet[]>("/trajets");
  return data;
};

export const getTrajetById = async (id: string): Promise<Trajet> => {
  const { data } = await apiClient.get<Trajet>(`/trajets/${id}`);
  return data;
};

export const createTrajet = async (payload: TrajetPayload): Promise<Trajet> => {
  const { data } = await apiClient.post<Trajet>("/trajets", payload);
  return data;
};

export const updateTrajet = async (id: string, payload: TrajetPayload): Promise<Trajet> => {
  const { data } = await apiClient.put<Trajet>(`/trajets/${id}`, payload);
  return data;
};

export const updateStatut = async (
  id: string,
  payload: { statut: Trajet["statut"] }
): Promise<Trajet> => {
  const { data } = await apiClient.patch<Trajet>(`/trajets/${id}/statut`, payload);
  return data;
};

export const updateKmEtGasoil = async (
  id: string,
  payload: { kmArrivee?: number; gasoil?: number }
): Promise<Trajet> => {
  const { data } = await apiClient.patch<Trajet>(`/trajets/${id}/km-gasoil`, payload);
  return data;
};

export const deleteTrajet = async (id: string): Promise<{ success: boolean } | Trajet> => {
  const { data } = await apiClient.delete<{ success: boolean } | Trajet>(`/trajets/${id}`);
  return data;
};

export const getTrajetPDF = async (id: string): Promise<Blob> => {
  const { data } = await apiClient.get(`/trajets/${id}/pdf`, { responseType: "blob" });
  return data as Blob;
};
