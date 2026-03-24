import { Model } from "./model";
import type { User } from "./user";

const API_URL = "/api/projects";

export type ProjectPayload = {
  title: string;
  summary: string;
  urlDemo: string;
  urlRep: string;
  image: string;
  authorId: number;
  like?: number;
  tags: string[];
  isActive?: boolean;
};

type ProjectResponse = ProjectPayload & {
  id?: number;
  authorUsername?: string;
  likedBy?: number[];
};

export class Project extends Model {
  id!: number;
  authorUsername?: string;
  likedBy?: number[];
  title!: string;
  summary!: string;
  urlDemo!: string;
  urlRep!: string;
  image!: string;
  authorId!: number;
  like!: number;
  tags!: string[];
  isActive!: boolean;

  constructor(data: ProjectResponse) {
    super();
    Object.assign(this, data);
  }

  static async getAll(): Promise<Project[]> {
    const res = await this.send_request("GET", API_URL);

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
    const response = await this.send_request("POST", API_URL, project);

    if (!response.ok) {
      throw new Error("Project creation failed");
    }

    const data = await response.json();
    return new Project(data);
  }

  static async update(
    projectId: number,
    project: Partial<Project>,
  ): Promise<void> {
    const response = await this.send_request(
      "PATCH",
      `${API_URL}/${projectId}`,
      project,
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
