import { API_BASE_URL } from "./config";

export interface ApiEnvelope<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

interface ApiRequestOptions extends RequestInit {
  token?: string | null;
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiClient<T = ApiEnvelope>(
  path: string,
  { token, headers, body, ...rest }: ApiRequestOptions = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const finalHeaders = new Headers(headers);

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (!isFormData && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: isFormData ? (body as BodyInit) : body,
    cache: rest.cache ?? "no-store",
    credentials: "include", // send cookies so backend can read auth cookie
  });

  const raw = await response.text();
  const parsed = raw ? JSON.parse(raw) : {};

  if (!response.ok || parsed?.success === false) {
    throw new ApiError(parsed.message || "Request failed", response.status);
  }

  return parsed as T;
}

