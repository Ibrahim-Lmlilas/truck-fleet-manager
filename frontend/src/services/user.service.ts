import { apiClient } from "./apiClient";

export type User = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'chauffeur';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UserPayload = {
  nom?: string;
  prenom?: string;
  email?: string;
  isActive?: boolean;
};

export const getUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: User[] }>("/users");
  return data.data || [];
};

export const getChauffeurs = async (): Promise<User[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: User[] }>("/users/chauffeurs");
  return data.data || [];
};

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await apiClient.get<{ success: boolean; data: User }>(`/users/${id}`);
  return data.data;
};

export const updateUser = async (id: string, payload: UserPayload): Promise<User> => {
  const { data } = await apiClient.put<{ success: boolean; data: User }>(`/users/${id}`, payload);
  return data.data;
};

export const deleteUser = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean; message?: string }>(`/users/${id}`);
  return { success: data.success };
};

