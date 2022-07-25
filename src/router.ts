import { Context } from "./context.ts";
import { Responder } from "./responder.ts";

export interface Route<
  RequestPayload = Record<never, never> | never[],
  ResponsePayload = Record<never, never> | never[]
> {
  method: "GET" | "POST" | "PUT" | "PATCH";
  pattern: string;

  handle(
    responder: Responder<ResponsePayload>,
    context: Context<RequestPayload>
  ): Promise<Responder<ResponsePayload>> | Responder<ResponsePayload>;

  request?: {
    before?(): void;
    validate?(body?: unknown): boolean;
  };

  response?: {
    validate?(body?: ResponsePayload): boolean;
  };
}

const DEFAULT_ROUTE: Route = {
  method: "GET",
  pattern: "/",
  handle: (response, context) => {
    return response;
  },
};

const DEFAULT_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

export class Router {
  routes: Route[] = [];

  match = (request: Request): Response | Promise<Response> => {
    const url = new URL(request.url);

    // world's most naive route handling logic ahead!
    const route: Route | undefined = this.routes.find((r) => {
      const pattern = new URLPattern({ pathname: r.pattern });

      if (pattern.test(url.pathname)) {
        return r;
      }
    });

    if (!route) {
      const body = JSON.stringify({ message: "Not found" });

      return new Response(body, {
        status: 404,
        headers: {
          ...DEFAULT_HEADERS,
        },
      });
    }

    if (route.request?.before) {
      route.request.before();
    }

    if (route.request?.validate) {
      if (!route.request.validate(request.body)) {
        const body = JSON.stringify({ message: "Bad request" });

        return new Response(body, {
          status: 400,
          headers: {
            ...DEFAULT_HEADERS,
          },
        });
      }
    }

    try {
      const executed = route.handle(new Responder(), {
        request,
        searchParams: url.searchParams,
      });

      if (route.response?.validate) {
        if (!route.response.validate(executed)) {
          const body = JSON.stringify({ message: "Bad request" });

          return new Response(body, {
            status: 400,
            headers: {
              ...DEFAULT_HEADERS,
            },
          });
        }
      }

      return new Response(JSON.stringify(executed), {
        status: 200,
        headers: {
          ...DEFAULT_HEADERS,
        },
      });
    } catch (e) {
      const body = JSON.stringify({ message: "Internal Server Error" });

      console.error(e);

      return new Response(body, {
        status: 500,
        headers: {
          ...DEFAULT_HEADERS,
        },
      });
    }
  };
}
