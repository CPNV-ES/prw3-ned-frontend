import { Model } from "./model";
import type { User } from "./user";

const API_URL = "/api/projects";

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

type ProjectResponse = Omit<ProjectPayload, "image"> & {
  id?: number;
  likes?: number;
  author_id: number;
  author_name?: string;
  image_url?: string;
  created_at?: string;
};

export class Project extends Model {
  id!: number;
  title!: string;
  summary!: string;
  demo_url!: string;
  repository_url!: string;
  image_url!: string;
  author_id!: number;
  author_name!: string;
  likes!: number;
  tags!: string[];
  created_at!: string;

  constructor(data: ProjectResponse) {
    super();
    Object.assign(this, data);
  }

  private static toFormData(project: Partial<ProjectPayload>): FormData {
    const formData = new FormData();

    if (project.title !== undefined) {
      formData.append("title", project.title);
    }
    if (project.summary !== undefined) {
      formData.append("summary", project.summary);
    }
    if (project.demo_url !== undefined) {
      formData.append("demo_url", project.demo_url);
    }
    if (project.repository_url !== undefined) {
      formData.append("repository_url", project.repository_url);
    }
    if (Array.isArray(project.tags)) {
      formData.append("tags", JSON.stringify(project.tags));
    }
    if (project.image instanceof File) {
      formData.append("image", project.image);
    }

    return formData;
  }

  static async getAll(query: ProjectQuery = {}): Promise<Project[]> {
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

    const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;
    const res = await this.send_request("GET", url);

    if (!res.ok) {
      throw new Error("Project fetch failed");
    }

    const data: ProjectResponse[] = await res.json();
    return data.map((project) => new Project(project));
  }

  static async getCurrent(projectId: number): Promise<Project | null> {
    const res = await this.send_request("GET", `${API_URL}/${projectId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return new Project(data);
  }

  static async create(project: ProjectPayload): Promise<Project> {
    const response = await this.send_request(
      "POST",
      API_URL,
      this.toFormData(project),
    );

    if (!response.ok) {
      throw new Error("Project creation failed");
    }

    const data = await response.json();
    return new Project(data);
  }

  static async update(
    projectId: number,
    project: Partial<ProjectPayload>,
  ): Promise<void> {
    const response = await this.send_request(
      "PUT",
      `${API_URL}/${projectId}`,
      this.toFormData(project),
    );

    if (!response.ok) {
      throw new Error("Project update failed");
    }
  }

  static async delete(projectId: number): Promise<void> {
    const response = await this.send_request(
      "DELETE",
      `${API_URL}/${projectId}`,
    );

    if (!response.ok) {
      throw new Error("Project deletion failed");
    }
  }

  static async liked(projectId: number, user: User): Promise<Project> {
    const response = await this.send_request(
      "POST",
      `${API_URL}/${projectId}/like`,
      {
        userId: user.id,
      },
    );

    if (!response.ok) {
      throw new Error("Project like failed");
    }

    const data = await response.json();
    return new Project(data);
  }
}
