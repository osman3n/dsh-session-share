import assert from "node:assert/strict";
import { apply } from "../index.js";

function makeContext() {
  const routes = new Map();
  const events = [];
  const session = {
    id: "sess-new",
    append(type, data, opts) {
      events.push({ type, data, ...(opts?.surfaceOp === undefined ? {} : { surfaceOp: opts.surfaceOp }) });
    },
  };
  let renamed = null;
  let flushed = false;
  const created = [];
  const ctx = {
    connection: {
      fetch: {
        register(route) {
          routes.set(route.path, route);
          return () => {};
        },
      },
    },
    get(name) {
      if (name === "sessionController") {
        return {
          create: async (options) => {
            created.push(options);
            return { sessionId: "sess-new" };
          },
        };
      }
      if (name === "sessions") {
        return {
          get: (id) => (id === "sess-new" ? session : undefined),
          flush: async () => {
            flushed = true;
            return true;
          },
        };
      }
      if (name === "sessionTitle") {
        return {
          rename: (_session, title) => {
            renamed = title;
            return { title, eventSeq: 1 };
          },
        };
      }
      return undefined;
    },
  };
  apply(ctx);
  return { route: routes.get("/api/session.share/continue"), events, session, flushed: () => flushed, renamed: () => renamed, created };
}

const payload = {
  format: "dsh-session-share",
  version: 1,
  title: "Imported demo",
  sessionId: "sess-source",
  cwd: "C:\\work",
  workspaceId: "ws-target",
  turns: [
    {
      segments: [
        {
          kind: "user",
          text: "hello",
          attachments: [{ kind: "file", name: "report.pdf", bytes: 2048, mediaType: "application/pdf" }],
        },
        { kind: "assistant", text: "checking", toolCalls: true },
        { kind: "tool", name: "read", arguments: "{\"path\":\"a.txt\"}", result: { text: "file body", isError: false, reason: "" } },
        { kind: "assistant", text: "done" },
      ],
    },
  ],
};

const { route, events, flushed, renamed, created } = makeContext();
const response = await route.fetch(new Request("http://localhost/api/session.share/continue", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
}));
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), { sessionId: "sess-new" });
assert.equal(flushed(), true);
assert.equal(renamed(), "Imported demo");
assert.deepEqual(created, [{ workspaceId: "ws-target" }]);
assert.deepEqual(events.map((event) => event.type), [
  "turn/start",
  "step/start",
  "system/message",
  "user/message",
  "assistant/message",
  "tool/call",
  "tool/result",
  "assistant/message",
  "step/end",
  "turn/end",
]);
assert.equal(events[0].data.turn, 1);
assert.equal(events[1].data.step, 1);
assert.equal(events[2].data.turn, 1);
assert.equal(events[2].data.step, 1);
assert.equal(events[2].data.message.role, "system");
assert.equal(events[3].data.content[0].text, "hello\n[Imported file: report.pdf]");
assert.equal(events[3].data.content[0].type, "text");
assert.equal(events[4].data.message.content[0].text, "checking");
assert.equal(events[4].data.message.content[1].type, "tool-call");
assert.equal(events[4].data.message.content[1].name, "read");
assert.equal(events[4].data.message.content[1].arguments, "{\"path\":\"a.txt\"}");
const callId = events[4].data.message.content[1].id;
assert.match(callId, /^call_[0-9a-f]+$/);
assert.equal(events[5].data.callId, callId);
assert.equal(events[5].data.name, "read");
assert.equal(events[5].data.arguments, "{\"path\":\"a.txt\"}");
assert.equal(events[6].data.message.toolCallId, callId);
assert.equal(events[6].data.message.source.kind, "tool");
assert.equal(events[6].data.message.source.callId, callId);
assert.equal(events[6].data.message.content[0].text, "file body");
assert.equal(events[6].data.message.isError, false);
assert.equal(typeof events[6].data.message.id, "string");
assert.equal(events[7].data.message.content[0].text, "done");
assert.equal(events[9].data.reason.kind, "completed");

const bad = await route.fetch(new Request("http://localhost/api/session.share/continue", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ format: "other", version: 1, turns: [] }),
}));
assert.equal(bad.status, 400);

const tooMany = await route.fetch(new Request("http://localhost/api/session.share/continue", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ format: "dsh-session-share", version: 1, turns: Array.from({ length: 201 }, () => ({ segments: [] })) }),
}));
assert.equal(tooMany.status, 400);

const fallback = makeContext();
const noWorkspacePayload = { ...payload };
delete noWorkspacePayload.workspaceId;
const fallbackResponse = await fallback.route.fetch(new Request("http://localhost/api/session.share/continue", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(noWorkspacePayload),
}));
assert.equal(fallbackResponse.status, 200);
assert.deepEqual(fallback.created, [{}]);

console.log("continue-route.test.mjs: all assertions passed");
