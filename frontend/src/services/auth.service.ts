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

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role?: string;
};

export type LogoutResponse = {
  success: boolean;
  message?: string;
};

export type GetMeResponse = {
  success: boolean;
  data: {
    user: UserProfile;
  };
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
  setAuthToken(data.data.token);
  return data;
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
  setAuthToken(data.data.token);
  return data;
};

export const logout = async (): Promise<LogoutResponse> => {
  const { data } = await apiClient.post<LogoutResponse>("/auth/logout");
  setAuthToken(null);
  return data;
};

export const getMe = async (): Promise<UserProfile> => {
  const { data } = await apiClient.get<GetMeResponse>("/auth/me");
  return data.data.user;
};
