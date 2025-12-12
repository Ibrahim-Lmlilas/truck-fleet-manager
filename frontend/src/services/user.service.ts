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

// Type pour la réponse backend qui utilise _id
type UserBackend = {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'chauffeur';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Mapper _id vers id
const mapUserBackendToUser = (userBackend: UserBackend): User => ({
  id: userBackend._id,
  nom: userBackend.nom,
  prenom: userBackend.prenom,
  email: userBackend.email,
  role: userBackend.role,
  isActive: userBackend.isActive,
  createdAt: userBackend.createdAt,
  updatedAt: userBackend.updatedAt,
});

export const getUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: UserBackend[] }>("/users");
  return (data.data || []).map(mapUserBackendToUser);
};

export const getChauffeurs = async (): Promise<User[]> => {
  const { data } = await apiClient.get<{ success: boolean; data: UserBackend[] }>("/users/chauffeurs");
  return (data.data || []).map(mapUserBackendToUser);
};

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await apiClient.get<{ success: boolean; data: UserBackend }>(`/users/${id}`);
  return mapUserBackendToUser(data.data);
};

export const updateUser = async (id: string, payload: UserPayload): Promise<User> => {
  const { data } = await apiClient.put<{ success: boolean; data: UserBackend }>(`/users/${id}`, payload);
  return mapUserBackendToUser(data.data);
};

export const deleteUser = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await apiClient.delete<{ success: boolean; message?: string }>(`/users/${id}`);
  return { success: data.success };
};

