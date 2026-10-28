import { apiClient, ApiEnvelope } from "@/lib/apiClient";
import { Email, PaginatedResponse } from "@/types/api";

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
}

const buildPaginationQuery = (params?: PaginationParams) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status) searchParams.set("status", params.status);
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const fetchEmails = (
  token: string,
  params?: PaginationParams
) =>
  apiClient<ApiEnvelope<PaginatedResponse<Email>> | { emails: Email[]; pagination: any }>(
    `/emails${buildPaginationQuery(params)}`,
    { token }
  );

export const getEmailById = (token: string, id: string) =>
  apiClient<ApiEnvelope<Email>>(`/emails/${id}`, { token });

export const deleteEmail = (token: string, id: string) =>
  apiClient<ApiEnvelope<void>>(`/emails/${id}`, {
    token,
    method: "DELETE",
  });

export const updateEmailStatus = (
  token: string,
  id: string,
  status: "pending" | "responded" | "closed"
) =>
  apiClient<ApiEnvelope<Email>>(`/emails/${id}/status`, {
    token,
    method: "PUT",
    body: JSON.stringify({ status }),
  });

