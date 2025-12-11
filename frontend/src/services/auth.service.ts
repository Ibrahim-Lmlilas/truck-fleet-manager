import { apiClient, setAuthToken } from "./apiClient";

export type UserProfile = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  isActive?: boolean;
};

export type AuthResponse = {
  success: boolean;
  data: {
    user: UserProfile;
    token: string;
  };
};

export const register = async (payload: {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role?: string;
}): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
  setAuthToken(data.data.token);
  return data;
};

export const login = async (payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  setAuthToken(data.data.token);
  return data;
};

export const logout = async (): Promise<{ success: boolean; message?: string }> => {
  const { data } = await apiClient.post<{ success: boolean; message?: string }>("/auth/logout");
  setAuthToken(null);
  return data;
};

export const getMe = async (): Promise<UserProfile> => {
  const { data } = await apiClient.get<{ success: boolean; data: { user: UserProfile } }>(
    "/auth/me"
  );
  return data.data.user;
};
