import { apiClient, ApiEnvelope } from "@/lib/apiClient";
import { Testimonial, TestimonialPayload } from "@/types/api";

export interface TestimonialFilters {
  featured?: boolean;
  status?: "active" | "inactive";
  limit?: number;
  page?: number;
}

const buildQuery = (filters?: TestimonialFilters) => {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.featured !== undefined)
    params.set("featured", String(filters.featured));
  if (filters.status) params.set("status", filters.status);
  // Fetch a large page for the dashboard table (pagination is client-side)
  params.set("limit", String(filters.limit ?? 200));
  if (filters.page !== undefined) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : "";
};

/** Admin: fetch all testimonials (any status), paginated on the server but
 * we default to a high limit so the table can paginate client-side like the
 * properties table does. */
export const fetchTestimonials = (
  token: string,
  filters?: TestimonialFilters
) =>
  apiClient<ApiEnvelope<Testimonial[]>>(`/testimonials${buildQuery(filters)}`, {
    token,
  });

/** Public: fetch active testimonials only (used on the storefront). */
export const fetchActiveTestimonials = () =>
  apiClient<ApiEnvelope<Testimonial[]>>("/testimonials/active");

export const createTestimonial = (token: string, payload: FormData) =>
  apiClient<ApiEnvelope<Testimonial>>("/testimonials", {
    method: "POST",
    token,
    body: payload,
  });

export const updateTestimonial = (
  token: string,
  id: string,
  payload: FormData
) =>
  apiClient<ApiEnvelope<Testimonial>>(`/testimonials/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });

export const deleteTestimonial = (token: string, id: string) =>
  apiClient<ApiEnvelope<{ message: string }>>(`/testimonials/${id}`, {
    method: "DELETE",
    token,
  });

export const toggleTestimonialStatus = (token: string, id: string) =>
  apiClient<ApiEnvelope<Testimonial>>(`/testimonials/${id}/status`, {
    method: "PATCH",
    token,
  });