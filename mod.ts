import { serve, ServeInit } from "https://deno.land/std@0.149.0/http/server.ts";
import { Router, Route } from "./src/router.ts";

export interface BounceOptions extends Partial<Deno.ListenOptions> {}

export default class Bounce {
  router = new Router();

  async run(options: BounceOptions): Promise<void> {
    const init: ServeInit = {
      onListen: ({ port, hostname }) => {
        console.log(`[Bounce] has started at http://${hostname}:${port}`);
      },
      ...options
    };

    await serve(this.router.match, init);
  }
}

export type { Route };
