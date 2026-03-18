export class Model {
  static async send_request(
    method: string,
    url: string,
    body?: unknown,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (localStorage.getItem("token")) {
      headers["Authorization"] = `${localStorage.getItem("token")}`;
    }
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return response;
  }
}
