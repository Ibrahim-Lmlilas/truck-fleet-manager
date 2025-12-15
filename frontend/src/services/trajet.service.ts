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

export type UpdateStatutPayload = {
  statut: Trajet["statut"];
};

export type UpdateKmEtGasoilPayload = {
  kmDepart?: number;
  kmArrivee?: number;
  gasoilConsomme?: number;
};

export type TrajetResponse = {
  success: boolean;
  data: Trajet;
};

export type TrajetsResponse = {
  success: boolean;
  data: Trajet[];
};

export type DeleteTrajetResponse = {
  success: boolean;
  message?: string;
};

export const getTrajets = async (): Promise<Trajet[]> => {
  const { data } = await apiClient.get<TrajetsResponse>("/trajets");
  return data.data || [];
};

export const getTrajetById = async (id: string): Promise<Trajet> => {
  const { data } = await apiClient.get<TrajetResponse>(`/trajets/${id}`);
  return data.data;
};

export const createTrajet = async (payload: TrajetPayload): Promise<Trajet> => {
  const { data } = await apiClient.post<TrajetResponse>("/trajets", payload);
  return data.data;
};

export const updateTrajet = async (id: string, payload: TrajetPayload): Promise<Trajet> => {
  const { data } = await apiClient.put<TrajetResponse>(`/trajets/${id}`, payload);
  return data.data;
};

export const updateStatut = async (id: string, payload: UpdateStatutPayload): Promise<Trajet> => {
  const { data } = await apiClient.patch<TrajetResponse>(`/trajets/${id}/statut`, payload);
  return data.data;
};

export const updateKmEtGasoil = async (id: string, payload: UpdateKmEtGasoilPayload): Promise<Trajet> => {
  const { data } = await apiClient.patch<TrajetResponse>(`/trajets/${id}/km-gasoil`, payload);
  return data.data;
};

export const deleteTrajet = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<DeleteTrajetResponse>(`/trajets/${id}`);
  return { success: data.success };
};

export const getTrajetPDF = async (id: string): Promise<Blob> => {
  const response = await apiClient.get(`/trajets/${id}/pdf`, { 
    responseType: "blob" 
  });
  return response.data as Blob;
};
