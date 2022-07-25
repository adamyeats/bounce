export class Responder<Response> {
  status(statusCode: number): Responder<Response> {
    return this;
  }

  body(body: Response): Responder<Response> {
    return this;
  }

  headers(headers: Record<string, string>): Responder<Response> {
    return this;
  }
}
