# ⛹️‍♂️ Bounce

A high-level HTTP framework for Deno.

## ⚠️ Here be dragons!

Don't use this for anything, ever, especially not production applications. It's purely a toy framework and just something I made for fun.

## Usage

```ts
interface TestRouteRequest {}

interface TestRouteResponse {}

// Bounce's `JSONRoute`s are typesafe. Both the request and the response need to have
// a defined interface.
export const route: Route<TestRouteRequest, TestRouteResponse> = {
  method: "GET",
  // `pattern` is in `path-to-regexp`, `URLPattern` style
  pattern: "/users/:user",
  handle: (response, context) => {
    // `context` contains parsed information for the incoming request,
    // including query body, headers, and the Deno connection. The object
    // can also be augmented by the `before()` method to include arbitrary
    // data, such as the authenticated user.
    if (!context.body) {
      return response.status(400).body({});
    }

    // Throwing an error in a handler automatically returns a 500 response
    // to the client. Any other response than a 500 should be handled
    // explicitly.
    if (1 > 2) {
      throw new Error("There was a rift in spacetime");
    }

    // when `response` is returned, the connection is implicitly closed
    // with any provided data. Bounce respects the HTTP spec - for instance,
    // if a `response` is returned with no `body` or `status`, then Bounce
    // can infer that a `204 No Content` is a sensible default response for
    // that request.
    return response;
  },
  request: {
    before: () => {
      // The `before()` function runs before the request is validated or the
      // handler function. This is the place to run your authentication logic.
    },
    validate: (body) => {
      // Bounce is agnostic to your choice of validator. All you need to do
      // is to ensure this function returns true to confirm the body is valid.
      // How you do this is up to you, you could use Joi, or some kind of type
      // reflection, etc.
      return true;
    },
  },
};

// initialise the server in your entrypoint
// routes are loaded automatically (@TODO: based on what?)
try {
  const server = new Bounce();
  await server.run({ port: 8080 });
} catch (e) {
  console.error(e);
}
```
