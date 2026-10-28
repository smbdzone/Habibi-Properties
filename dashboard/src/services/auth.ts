import { apiClient, ApiEnvelope } from "@/lib/apiClient";
import { AdminProfile } from "@/types/api";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  admin: AdminProfile;
}

export const loginAdmin = (payload: LoginPayload) =>
  apiClient<ApiEnvelope<LoginResponse>>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchAdminProfile = (token: string) =>
  apiClient<ApiEnvelope<AdminProfile>>("/admin/auth/me", { token });

