const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:5000/api";

export interface ApiEnvelope<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
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
    options: RequestInit = {}
): Promise<T> {
    const { headers, body, ...rest } = options;

    const url = path.startsWith("http")
        ? path
        : `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;

    const finalHeaders = new Headers(headers);

    const isFormData =
        typeof FormData !== "undefined" &&
        body instanceof FormData;

    if (!isFormData && !finalHeaders.has("Content-Type")) {
        finalHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
        ...rest,
        headers: finalHeaders,
        body: isFormData ? body : body,
        credentials: "include",
    });

    const raw = await response.text();

    let parsed: any = {};

    try {
        parsed = raw ? JSON.parse(raw) : {};
    } catch {
        throw new ApiError("Invalid server response", response.status);
    }

    if (!response.ok || parsed?.success === false) {
        throw new ApiError(
            parsed.message || "Request failed",
            response.status
        );
    }

    return parsed as T;
}