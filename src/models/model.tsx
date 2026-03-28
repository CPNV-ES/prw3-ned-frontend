export class Model {
  static async send_request(
    method: string,
    url: string,
    body?: unknown,
  ): Promise<Response> {
    const headers: Record<string, string> = {};
    if (localStorage.getItem("token")) {
      headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
    }

    const isFormData = body instanceof FormData;
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
    return response;
  }
}
