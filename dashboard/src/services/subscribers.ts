import { apiClient, ApiEnvelope } from "@/lib/apiClient";
import { ContactMessage, Enquiry, PaginatedResponse, Subscriber, Email } from "@/types/api";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

const buildPaginationQuery = (params?: PaginationParams) => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const fetchSubscribers = (
  token: string,
  params?: PaginationParams
) =>
  apiClient<ApiEnvelope<PaginatedResponse<Subscriber>>>(
    `/newsletter/subscribers${buildPaginationQuery(params)}`,
    { token }
  );

export const fetchEnquiries = (token: string) =>
  apiClient<ApiEnvelope<Enquiry[]>>("/enquiries", { token });

export const fetchContacts = (token: string, params?: PaginationParams) =>
  apiClient<ApiEnvelope<PaginatedResponse<ContactMessage>>>(
    `/contact/admin/contacts${buildPaginationQuery(params)}`,
    { token }
  );

export const getContactById = (token: string, id: string) =>
  apiClient<ApiEnvelope<ContactMessage>>(`/contact/admin/contacts/${id}`, { token });

export const deleteContact = (token: string, id: string) =>
  apiClient<ApiEnvelope<void>>(`/contact/admin/contacts/${id}`, {
    token,
    method: "DELETE",
  });

export const getEnquiryById = (token: string, id: string) =>
  apiClient<ApiEnvelope<Enquiry>>(`/enquiries/${id}`, { token });

export const deleteEnquiry = (token: string, id: string) =>
  apiClient<ApiEnvelope<void>>(`/enquiries/${id}`, {
    token,
    method: "DELETE",
  });

export const getSubscriberById = (token: string, id: string) =>
  apiClient<ApiEnvelope<Subscriber>>(`/newsletter/subscribers/${id}`, { token });

export const deleteSubscriber = (token: string, id: string) =>
  apiClient<ApiEnvelope<void>>(`/newsletter/subscribers/${id}`, {
    token,
    method: "DELETE",
  });

// Email functions
export const fetchEmails = (token: string, params?: PaginationParams) =>
  apiClient<ApiEnvelope<Email[]>>(
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

export const updateEmailStatus = (token: string, id: string, status: "pending" | "responded" | "closed") =>
  apiClient<ApiEnvelope<Email>>(`/emails/${id}/status`, {
    token,
    method: "PUT",
    body: JSON.stringify({ status }),
  });

