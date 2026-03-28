import { Model } from "./model";

export class User extends Model {
  id: number;
  username: string;
  name: string;

  constructor(id: number, username: string, name: string) {
    super();
    this.id = id;
    this.username = username;
    this.name = name;
  }

  static async logout(): Promise<void> {
    const response = await this.send_request("DELETE", "/api/sessions");

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    localStorage.removeItem("token");
  }

  static async login(username: string, password: string): Promise<User> {
    const response = await this.send_request("POST", "/api/sessions", {
      username,
      password,
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    return new User(data.user.id, data.user.username, data.user.name);
  }

  static async register(
    name: string,
    username: string,
    password: string,
  ): Promise<User> {
    const response = await this.send_request("POST", "/api/users", {
      name,
      username,
      password,
    });

    if (!response.ok) {
      const err = new Error("Register failed") as Error & { status?: number };
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return new User(data.id, data.username, data.name);
  }

  static async current(): Promise<User | null> {
    const response = await this.send_request("GET", "/api/sessions");

    if (!response.ok) {
      localStorage.removeItem("token");
      return null;
    }

    const data = await response.json();
    return new User(data.user.id, data.user.username, data.user.name);
  }
}
