import { apiRequest, ApiError } from "./client";

export type AuthUser = {
  id: number;
  username: string;
  name: string;
};

type SessionResponse = {
  expiresAt: string;
  user: AuthUser;
};

type CurrentSessionResponse = {
  expiresAt: string;
  user: AuthUser;
};

export async function login(
  username: string,
  password: string,
): Promise<AuthUser> {
  const data = await apiRequest<SessionResponse>("/api/sessions", {
    method: "POST",
    body: { username, password },
  });
  return data.user;
}

export async function logout(): Promise<void> {
  await apiRequest<void>("/api/sessions", { method: "DELETE" });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const data = await apiRequest<CurrentSessionResponse>("/api/sessions", {
      method: "GET",
    });
    return data.user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    }
    throw err;
  }
}

export async function register(
  name: string,
  username: string,
  password: string,
): Promise<AuthUser> {
  return apiRequest<AuthUser>("/api/users", {
    method: "POST",
    body: { name, username, password },
  });
}
