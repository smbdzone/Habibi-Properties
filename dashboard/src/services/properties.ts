import { apiClient, ApiEnvelope } from "@/lib/apiClient";
import { Property, PropertyPayload } from "@/types/api";

export interface PropertyFilters {
  category?: string;
  subtype?: string;
  location?: string;
  bedrooms?: string;
  limit?: number;
  page?: number;
}

const buildQuery = (filters?: PropertyFilters) => {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.subtype) params.set("subtype", filters.subtype);
  if (filters.location) params.set("location", filters.location);
  if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
  // Fetch all for dashboard (pagination is client-side); optional limit/page for server pagination
  params.set("limit", String(filters.limit ?? 200));
  if (filters.page !== undefined) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const fetchProperties = (filters?: PropertyFilters) =>
  apiClient<ApiEnvelope<Property[]>>(`/properties${buildQuery(filters)}`);

/** Fetch properties for search autocomplete (higher limit, no filters) */
export const fetchPropertiesForSearch = (token?: string) =>
  apiClient<ApiEnvelope<Property[]>>("/properties?limit=150", { token });

export const fetchPropertyById = (id: string, token?: string) =>
  apiClient<ApiEnvelope<Property>>(`/properties/${id}`, {
    token,
  });

export const createProperty = (token: string, payload: PropertyPayload) =>
  apiClient<ApiEnvelope<Property>>("/properties", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

export const updateProperty = (
  token: string,
  id: string,
  payload: Partial<PropertyPayload>
) =>
  apiClient<ApiEnvelope<Property>>(`/properties/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });

// File upload versions
export const createPropertyWithFiles = (token: string, formData: FormData) =>
  apiClient<ApiEnvelope<Property>>("/properties", {
    method: "POST",
    token,
    body: formData,
  });

export const updatePropertyWithFiles = (
  token: string,
  id: string,
  formData: FormData
) =>
  apiClient<ApiEnvelope<Property>>(`/properties/${id}`, {
    method: "PUT",
    token,
    body: formData,
  });

export const deleteProperty = (token: string, id: string) =>
  apiClient<ApiEnvelope<{ message: string }>>(`/properties/${id}`, {
    method: "DELETE",
    token,
  });

