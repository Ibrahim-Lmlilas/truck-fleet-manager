import { apiClient } from "./apiClient";

export type Maintenance = {
  _id: string;
  vehiculeId: string; // camion or remorque id
  type: string;
  description?: string;
  datePlanifiee: string;
  effectuee?: boolean;
  cout?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type MaintenancePayload = Omit<Maintenance, "_id" | "createdAt" | "updatedAt">;

export type MarkEffectueePayload = {
  dateFait?: string;
  kmMaintenance?: number;
  cout?: number;
  remarques?: string;
  prochainKm?: number;
};

export type MaintenanceResponse = {
  success: boolean;
  data: Maintenance;
};

export type MaintenancesResponse = {
  success: boolean;
  data: Maintenance[];
};

export type EcheancesResponse = {
  success: boolean;
  data: any;
};

export type DeleteMaintenanceResponse = {
  success: boolean;
  message?: string;
};

export const getMaintenances = async (): Promise<Maintenance[]> => {
  const { data } = await apiClient.get<MaintenancesResponse>("/maintenances");
  return data.data || [];
};

export const getMaintenanceById = async (id: string): Promise<Maintenance> => {
  const { data } = await apiClient.get<MaintenanceResponse>(`/maintenances/${id}`);
  return data.data;
};

export const getMaintenancesByVehicule = async (vehiculeId: string): Promise<Maintenance[]> => {
  const { data } = await apiClient.get<MaintenancesResponse>(`/maintenances/vehicule/${vehiculeId}`);
  return data.data || [];
};

export const getEcheancesByVehicule = async (vehiculeId: string): Promise<any> => {
  const { data } = await apiClient.get<EcheancesResponse>(`/maintenances/vehicule/${vehiculeId}/echeances`);
  return data.data;
};

export const getMaintenancesAlertes = async (): Promise<Maintenance[]> => {
  const { data } = await apiClient.get<MaintenancesResponse>("/maintenances/alertes");
  return data.data || [];
};

export const planifierMaintenance = async ( payload: MaintenancePayload ): Promise<Maintenance> => {
  const { data } = await apiClient.post<MaintenanceResponse>("/maintenances", payload);
  return data.data;
};

export const updateMaintenance = async (id: string,payload: MaintenancePayload ): Promise<Maintenance> => {
  const { data } = await apiClient.put<MaintenanceResponse>(`/maintenances/${id}`, payload);
  return data.data;
};

export const marquerCommeEffectuee = async (id: string, payload: MarkEffectueePayload): Promise<Maintenance> => {
  const { data } = await apiClient.patch<MaintenanceResponse>(`/maintenances/${id}/effectuee`, payload);
  return data.data;
};

export const deleteMaintenance = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<DeleteMaintenanceResponse>(`/maintenances/${id}`);
  return { success: data.success };
};
