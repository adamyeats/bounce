export interface Context<Request> {
  searchParams?: URLSearchParams

  body?: Request;

  request: Request;
}
