import { apiClient, ApiEnvelope } from "@/lib/apiClient";
import { Comment, PaginatedResponse } from "@/types/api";

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

export const fetchComments = (
  token: string,
  params?: PaginationParams
) =>
  apiClient<ApiEnvelope<PaginatedResponse<Comment>>>(
    `/comments/admin/comments${buildPaginationQuery(params)}`,
    { token }
  );

export const getCommentById = (token: string, id: string) =>
  apiClient<ApiEnvelope<Comment>>(`/comments/admin/${id}`, { token });

export const deleteComment = (token: string, id: string) =>
  apiClient<ApiEnvelope<void>>(`/comments/admin/${id}`, {
    token,
    method: "DELETE",
  });

export const updateCommentStatus = (
  token: string,
  id: string,
  status: "pending" | "approved" | "rejected"
) =>
  apiClient<ApiEnvelope<Comment>>(`/comments/admin/${id}/status`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

