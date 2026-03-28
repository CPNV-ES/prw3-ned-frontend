import { apiRequest, ApiError } from "./client";

export type User = {
  id: number;
  name: string;
  username: string;
};

export async function listUsers(
  options: {
    page?: number;
    limit?: number;
  } = {},
): Promise<User[]> {
  const params = new URLSearchParams();
  if (typeof options.page === "number") {
    params.set("page", String(options.page));
  }
  if (typeof options.limit === "number") {
    params.set("limit", String(options.limit));
  }

  const qs = params.toString();
  return apiRequest<User[]>(`/api/users${qs ? `?${qs}` : ""}`);
}

export async function getUser(userId: number): Promise<User | null> {
  try {
    return await apiRequest<User>(`/api/users/${userId}`, { method: "GET" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}
