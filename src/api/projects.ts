import { apiRequest, ApiError } from "./client";

const API_URL = "/api/projects";

export type Project = {
  id: number;
  title: string;
  summary: string;
  demo_url: string;
  repository_url: string;
  image_url: string;
  likes: number;
  created_at: string;
  author_id: number;
  author_name?: string;
  tags: string[];
};

export type ProjectQuery = {
  name?: string;
  tags?: string[];
  sortBy?: "date" | "likes";
  order?: "asc" | "desc";
};

export type ProjectPayload = {
  title: string;
  summary: string;
  demo_url: string;
  repository_url: string;
  image?: File;
  tags: string[];
};

type ProjectWriteBody = {
  title?: string;
  summary?: string;
  demo_url?: string;
  repository_url?: string;
  tags?: string[];
};

function normalizeTags(tags: string[]): string[] {
  return tags.map((tag) => tag.trim()).filter(Boolean);
}

function toJsonBody(payload: Partial<ProjectPayload>): ProjectWriteBody {
  const body: ProjectWriteBody = {};

  if (payload.title !== undefined) {
    body.title = payload.title;
  }
  if (payload.summary !== undefined) {
    body.summary = payload.summary;
  }
  if (payload.demo_url !== undefined) {
    body.demo_url = payload.demo_url;
  }
  if (payload.repository_url !== undefined) {
    body.repository_url = payload.repository_url;
  }

  if (Array.isArray(payload.tags)) {
    body.tags = normalizeTags(payload.tags);
  }

  return body;
}

function toFormData(payload: Partial<ProjectPayload>): FormData {
  const formData = new FormData();

  if (payload.title !== undefined) {
    formData.append("title", payload.title);
  }
  if (payload.summary !== undefined) {
    formData.append("summary", payload.summary);
  }
  if (payload.demo_url !== undefined) {
    formData.append("demo_url", payload.demo_url);
  }
  if (payload.repository_url !== undefined) {
    formData.append("repository_url", payload.repository_url);
  }
  if (Array.isArray(payload.tags)) {
    const tags = normalizeTags(payload.tags);
    for (const tag of tags) {
      formData.append("tags", tag);
    }
  }
  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  return formData;
}

function buildQueryString(query: ProjectQuery): string {
  const params = new URLSearchParams();

  if (query.name && query.name.trim()) {
    params.set("name", query.name.trim());
  }

  if (Array.isArray(query.tags) && query.tags.length > 0) {
    const tags = query.tags.map((tag) => tag.trim()).filter(Boolean);
    if (tags.length > 0) {
      params.set("tags", tags.join(","));
    }
  }

  if (query.sortBy) {
    params.set("sortBy", query.sortBy);
  }

  if (query.order) {
    params.set("order", query.order);
  }

  const str = params.toString();
  return str ? `?${str}` : "";
}

export async function listProjects(
  query: ProjectQuery = {},
): Promise<Project[]> {
  const qs = buildQueryString(query);
  return apiRequest<Project[]>(`${API_URL}${qs}`, { method: "GET" });
}

export async function getProject(projectId: number): Promise<Project | null> {
  try {
    return await apiRequest<Project>(`${API_URL}/${projectId}`, {
      method: "GET",
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  const hasImage = payload.image instanceof File;
  return apiRequest<Project>(API_URL, {
    method: "POST",
    body: hasImage ? toFormData(payload) : toJsonBody(payload),
  });
}

export async function updateProject(
  projectId: number,
  payload: Partial<ProjectPayload>,
): Promise<void> {
  const hasImage = payload.image instanceof File;
  await apiRequest<void>(`${API_URL}/${projectId}`, {
    method: "PUT",
    body: hasImage ? toFormData(payload) : toJsonBody(payload),
  });
}

export async function deleteProject(projectId: number): Promise<void> {
  await apiRequest<void>(`${API_URL}/${projectId}`, { method: "DELETE" });
}

export async function likeProject(
  projectId: number,
  userId?: number,
): Promise<Project> {
  return apiRequest<Project>(`${API_URL}/${projectId}/like`, {
    method: "POST",
    body: userId ? { userId } : undefined,
  });
}
