import { apiRequest, ApiError } from "./client";

export type User = {
  id: number;
  name: string;
  username: string;
};

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
