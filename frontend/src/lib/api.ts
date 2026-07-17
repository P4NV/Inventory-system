const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(body || res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type HealthStatus = {
  status: "ok";
  database: "connected" | "disconnected";
  timestamp: string;
};

export type Item = {
  id: string;
  name: string;
  sku: string;
  amount: number;
  price: number;
  isInStock: boolean;
  addedAt: string;
  updatedAt: string;
};

export type CreateItemInput = {
  name: string;
  sku: string;
  amount: number;
  price: number;
  isInStock?: boolean;
};

export type UpdateItemInput = {
  name?: string;
  sku?: string;
  amount?: number;
  price?: number;
  isInStock?: boolean;
};

export const api = {
  health: () => request<HealthStatus>("/health"),
  listItems: () => request<Item[]>("/items"),
  createItem: (data: CreateItemInput) =>
    request<Item>("/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id: string, data: UpdateItemInput) =>
    request<Item>(`/items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteItem: (id: string) => request<void>(`/items/${id}`, { method: "DELETE" }),
};
