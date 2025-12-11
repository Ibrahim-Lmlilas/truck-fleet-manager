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

export const getMaintenances = async (): Promise<Maintenance[]> => {
  const { data } = await apiClient.get<Maintenance[]>("/maintenances");
  return data;
};

export const getMaintenanceById = async (id: string): Promise<Maintenance> => {
  const { data } = await apiClient.get<Maintenance>(`/maintenances/${id}`);
  return data;
};

export const getMaintenancesByVehicule = async (vehiculeId: string): Promise<Maintenance[]> => {
  const { data } = await apiClient.get<Maintenance[]>(`/maintenances/vehicule/${vehiculeId}`);
  return data;
};

export const getEcheancesByVehicule = async (vehiculeId: string): Promise<any> => {
  const { data } = await apiClient.get<any>(`/maintenances/vehicule/${vehiculeId}/echeances`);
  return data;
};

export const getMaintenancesAlertes = async (): Promise<Maintenance[]> => {
  const { data } = await apiClient.get<Maintenance[]>("/maintenances/alertes");
  return data;
};

export const planifierMaintenance = async (
  payload: MaintenancePayload
): Promise<Maintenance> => {
  const { data } = await apiClient.post<Maintenance>("/maintenances", payload);
  return data;
};

export const updateMaintenance = async (
  id: string,
  payload: MaintenancePayload
): Promise<Maintenance> => {
  const { data } = await apiClient.put<Maintenance>(`/maintenances/${id}`, payload);
  return data;
};

export const marquerCommeEffectuee = async (
  id: string,
  payload: { effectuee: boolean }
): Promise<Maintenance> => {
  const { data } = await apiClient.patch<Maintenance>(`/maintenances/${id}/effectuee`, payload);
  return data;
};

export const deleteMaintenance = async (id: string): Promise<{ success: boolean } | Maintenance> => {
  const { data } = await apiClient.delete<{ success: boolean } | Maintenance>(
    `/maintenances/${id}`
  );
  return data;
};
