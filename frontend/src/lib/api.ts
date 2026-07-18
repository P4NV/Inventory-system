const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(body || res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type HealthStatus = {
  status: "ok";
  database: "connected" | "disconnected";
  timestamp: string;
};

export const CATEGORIES = [
  "general",
  "electronics",
  "furniture",
  "clothing",
  "food",
  "tools",
  "materials",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Item = {
  id: string;
  name: string;
  sku: string;
  amount: number;
  price: number;
  category: string;
  isInStock: boolean;
  addedAt: string;
  updatedAt: string;
};

export type CreateItemInput = {
  name: string;
  sku: string;
  amount: number;
  price: number;
  category?: string;
  isInStock?: boolean;
};

export type UpdateItemInput = {
  name?: string;
  sku?: string;
  amount?: number;
  price?: number;
  category?: string;
  isInStock?: boolean;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export const api = {
  health: () => request<HealthStatus>("/health"),
  listItems: () => request<Item[]>("/items"),
  createItem: (data: CreateItemInput) =>
    request<Item>("/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id: string, data: UpdateItemInput) =>
    request<Item>(`/items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteItem: (id: string) => request<void>(`/items/${id}`, { method: "DELETE" }),
  register: (data: { email: string; password: string; name?: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => request<User>("/auth/me"),
};
