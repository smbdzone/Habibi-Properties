import { apiClient, ApiEnvelope } from "@/lib/apiClient";
import { API_BASE_URL } from "@/lib/config";
import { Blog, BlogPayload } from "@/types/api";

export const fetchBlogs = () =>
  apiClient<ApiEnvelope<Blog[]>>("/blogs");

export const fetchBlogBySlug = (slug: string) =>
  apiClient<ApiEnvelope<Blog>>(`/blogs/${slug}`);

export const fetchBlogById = (token: string, id: string) =>
  apiClient<ApiEnvelope<Blog>>(`/blogs/admin/${id}`, {
    method: "GET",
    token,
  });

export const createBlog = (token: string, payload: BlogPayload) =>
  apiClient<ApiEnvelope<Blog>>("/blogs", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

// Create blog with FormData (for file uploads)
export const createBlogWithFile = async (
  token: string,
  formData: FormData
): Promise<ApiEnvelope<Blog>> => {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
  }

  const response = await fetch(`${API_BASE_URL}/blogs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create blog');
  }

  return result;
};

// Update blog with FormData (for file uploads)
export const updateBlogWithFile = async (
  token: string,
  id: string,
  formData: FormData
): Promise<ApiEnvelope<Blog>> => {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
  }

  const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update blog');
  }

  return result;
};

export const updateBlog = (
  token: string,
  id: string,
  payload: Partial<BlogPayload>
) =>
  apiClient<ApiEnvelope<Blog>>(`/blogs/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });

export const deleteBlog = (token: string, id: string) =>
  apiClient<ApiEnvelope<{ message: string }>>(`/blogs/${id}`, {
    method: "DELETE",
    token,
  });

