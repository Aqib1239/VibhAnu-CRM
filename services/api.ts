/**
 * API Service Client Abstraction
 *
 * Provides a unified HTTP client interface connected to the REST backend.
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
  errors?: Record<string, string> | string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  }

  // Simulated latency helper if needed
  async delay(ms: number = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Headers provider with JWT support
  getHeaders(isFormData: boolean = false): HeadersInit {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("vibhanu_crm_token") || localStorage.getItem("vibhanu_auth_token")
        : null;

    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private handleResponseError(status: number, data: any): never {
    let msg = data?.message || "An unexpected error occurred.";
    if (data?.errors) {
      if (typeof data.errors === "string") {
        msg = `${msg}: ${data.errors}`;
      } else if (typeof data.errors === "object") {
        const errorList = Object.entries(data.errors)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; ");
        msg = `${msg} (${errorList})`;
      }
    }
    const error: any = new Error(msg);
    error.status = status;
    error.errors = data?.errors;
    throw error;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        url += `${url.includes("?") ? "&" : "?"}${qs}`;
      }
    }

    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.handleResponseError(res.status, json);
    }

    return json;
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.handleResponseError(res.status, json);
    }

    return json;
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      method: "PATCH",
      headers: this.getHeaders(),
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.handleResponseError(res.status, json);
    }

    return json;
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(true),
      credentials: "include",
      body: formData,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.handleResponseError(res.status, json);
    }

    return json;
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.handleResponseError(res.status, json);
    }

    return json;
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.handleResponseError(res.status, json);
    }

    return json;
  }
}

export const api = new ApiClient();
