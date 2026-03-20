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

export class Project extends Model {
  id!: number;
  title!: string;
  summary!: string;
  urlDemo!: string;
  urlRep!: string;
  image!: string;
  authorId!: number;
  like!: number;
  tags!: string[];
  isActive!: boolean;


  constructor(data: ProjectPayload & { id?: number }) {
    super();
    Object.assign(this, data);
  }

  static async getAll(): Promise<Project[]> {
    const res = await this.send_request("GET", API_URL);

    if (!res.ok) {
      throw new Error("Project fetch failed");
    }

    const data = await res.json();
    return data.map((p: any) => new Project(p));
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

  static async update(projectId: number, project: Partial<Project>): Promise<void> {
    await this.send_request("PATCH", `${API_URL}/${projectId}`, project);
  }

  static async delete(projectId: number): Promise<void> {
    await this.send_request("DELETE", `${API_URL}/${projectId}`);
  }

  static async liked(projectId: number, user: User): Promise<void> {
    await this.send_request("POST", `${API_URL}/${projectId}/like`, {
      userId: user.id,
    });
  }
}
