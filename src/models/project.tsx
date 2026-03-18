import { Model } from "./model";
import type { User } from "./user";

export class Project extends Model {
  title: string;
  summary: string;
  urlDemo: string;
  urlRep: string;
  image: string;
  authorId: number;
  like: number;
  tags: string[];


  constructor(title: string, summary: string, urlDemo: string, urlRep: string, image: string, authorId: number, like: number, tags: string[]) {
    super();
    this.title = title;
    this.summary = summary;
    this.urlDemo = urlDemo;
    this.urlRep = urlRep;
    this.image = image;
    this.authorId = authorId;
    this.like = like;
    this.tags = tags;
  }

  static async getAll(): Promise<Project[] | null> { //remove null when doing it
    return null ;
  }

  static async getCurrent(projectId: number): Promise<Project | null> {
    return null;
  } //null if not found?

  static async create(title: string, summary: string, urlDemo: string, urlRep: string, image: string, authorId: number, like: number, tags: string[]): Promise<void> {

  }

  static async update(request: Request, projectId: number ): Promise<void> {

  }

  static async delete(projectId: number): Promise<void> {

  }

  static async liked(projectId: number, user: User): Promise<void>{

  }
}
