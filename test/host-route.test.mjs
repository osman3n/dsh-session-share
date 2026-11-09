import assert from "node:assert/strict";
import { apply } from "../index.js";

const snapshot = {
  session: { id: "sess-route", createdAt: "2026-11-09T02:00:00Z" },
  events: [
    { type: "session/title", data: { title: "Route test" } },
    { type: "turn/start", data: { turn: 1 } },
    {
      type: "user/message",
      surfaceOp: "append",
      data: { source: { kind: "user" }, content: [{ type: "text", text: "hello" }] },
    },
    {
      type: "assistant/message",
      surfaceOp: "append",
      data: { message: { content: [{ type: "text", text: "hi" }] } },
    },
    { type: "turn/end", data: { turn: 1, reason: "complete" } },
  ],
};

function makeContext({ withQuery = true, read } = {}) {
  const state = { route: null };
  const ctx = {
    connection: {
      fetch: {
        register(route) {
          state.route = route;
          return () => {};
        },
      },
    },
    get(name) {
      if (name === "sessionQuery" && withQuery) {
        return {
          readSession: read ?? (async (sessionId) => ({ ...snapshot, session: { ...snapshot.session, id: sessionId } })),
        };
      }
      return undefined;
    },
  };
  apply(ctx);
  return state.route;
}

const route = makeContext();
assert.equal(route.path, "/api/session.share");
assert.deepEqual(route.methods, ["GET", "HEAD"]);

const getResponse = await route.fetch(new Request("http://localhost/api/session.share?sessionId=sess-route", { method: "GET" }));
assert.equal(getResponse.status, 200);
assert.equal(getResponse.headers.get("content-type"), "text/html; charset=utf-8");
assert.equal(getResponse.headers.get("content-disposition"), 'attachment; filename="dsh-session-sess-route.html"');
assert.match(getResponse.headers.get("content-security-policy") ?? "", /default-src 'none'/);
const body = await getResponse.text();
assert.ok(body.includes("Route test"));
assert.ok(body.includes("hello"));

const headResponse = await route.fetch(new Request("http://localhost/api/session.share?sessionId=sess-route", { method: "HEAD" }));
assert.equal(headResponse.status, 200);
assert.equal(headResponse.headers.get("content-type"), "text/html; charset=utf-8");
assert.equal(headResponse.body, null);

const missing = await route.fetch(new Request("http://localhost/api/session.share", { method: "GET" }));
assert.equal(missing.status, 400);

const notFoundRoute = makeContext({
  read: async () => {
    const error = new Error("no such session");
    error.code = "SESSION_QUERY_SESSION_NOT_FOUND";
    throw error;
  },
});
const notFound = await notFoundRoute.fetch(new Request("http://localhost/api/session.share?sessionId=nope", { method: "GET" }));
assert.equal(notFound.status, 404);

const unavailableRoute = makeContext({ withQuery: false });
const unavailable = await unavailableRoute.fetch(new Request("http://localhost/api/session.share?sessionId=x", { method: "GET" }));
assert.equal(unavailable.status, 500);

const unsafeIdRoute = makeContext();
const unsafe = await unsafeIdRoute.fetch(new Request("http://localhost/api/session.share?sessionId=a%2Fb%22c", { method: "GET" }));
assert.equal(unsafe.status, 200);
assert.equal(unsafe.headers.get("content-disposition"), 'attachment; filename="dsh-session-a_b_c.html"');

console.log("host-route.test.mjs: all assertions passed");
