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
  const { data } = await apiClient.get<{ success: boolean; data: Maintenance[] }>("/maintenances");
  return data.data || [];
};

export const getMaintenanceById = async (id: string): Promise<Maintenance> => {
  const { data } = await apiClient.get<{ success: boolean; data: Maintenance }>(`/maintenances/${id}`);
  return data.data;
};

export const getMaintenancesByVehicule = async (vehiculeId: string): Promise<Maintenance[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: Maintenance[] }>(`/maintenances/vehicule/${vehiculeId}`);
  return data.data || [];
};

export const getEcheancesByVehicule = async (vehiculeId: string): Promise<any> => {
  const { data } = await apiClient.get<{ success: boolean; data: any }>(`/maintenances/vehicule/${vehiculeId}/echeances`);
  return data.data;
};

export const getMaintenancesAlertes = async (): Promise<Maintenance[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: Maintenance[] }>("/maintenances/alertes");
  return data.data || [];
};

export const planifierMaintenance = async (
  payload: MaintenancePayload
): Promise<Maintenance> => {
  const { data } = await apiClient.post<{ success: boolean; data: Maintenance }>("/maintenances", payload);
  return data.data;
};

export const updateMaintenance = async (
  id: string,
  payload: MaintenancePayload
): Promise<Maintenance> => {
  const { data } = await apiClient.put<{ success: boolean; data: Maintenance }>(`/maintenances/${id}`, payload);
  return data.data;
};

export const marquerCommeEffectuee = async (
  id: string,
  payload: { effectuee: boolean }
): Promise<Maintenance> => {
  const { data } = await apiClient.patch<{ success: boolean; data: Maintenance }>(`/maintenances/${id}/effectuee`, payload);
  return data.data;
};

export const deleteMaintenance = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean; message?: string }>(
    `/maintenances/${id}`
  );
  return { success: data.success };
};
