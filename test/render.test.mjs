import assert from "node:assert/strict";
import { renderSessionHtml } from "../index.js";

const snapshot = {
  session: {
    id: "sess-123",
    createdAt: "2026-11-09T02:00:00.000Z",
  },
  events: [
    {
      type: "session/title",
      data: { title: "<script>alert('title')</script>" },
    },
    {
      type: "turn/start",
      data: { turn: 1 },
    },
    {
      type: "user/message",
      surfaceOp: "append",
      data: {
        source: { kind: "user" },
        content: [{ type: "text", text: "Hello <img src=x onerror=alert(1)>" }],
      },
    },
    {
      type: "user/message",
      surfaceOp: "append",
      data: {
        source: { kind: "context" },
        content: [{ type: "text", text: "SECRET CONTEXT" }],
      },
    },
    {
      type: "assistant/message",
      surfaceOp: "append",
      data: {
        message: {
          content: [
            { type: "text", text: "Working **note** on the task." },
            { type: "tool-call", toolCallId: "call-1" },
          ],
        },
      },
    },
    {
      type: "tool/call",
      data: {
        turn: 1,
        step: 1,
        callId: "call-1",
        name: "<svg onload=alert(1)>",
        arguments: JSON.stringify({ command: "echo hi" }),
      },
    },
    {
      type: "tool/result",
      surfaceOp: "append",
      data: {
        turn: 1,
        step: 1,
        message: {
          toolCallId: "call-1",
          isError: false,
          content: [{ type: "text", text: "hi\n```js\nconsole.log(1)\n```" }],
        },
      },
    },
    {
      type: "assistant/message",
      surfaceOp: "append",
      data: {
        message: {
          content: [
            {
              type: "text",
              text: "Final answer with [link](https://example.com) and `code`.\n\n| Item | Status |\n| --- | :---: |\n| Route | ready |\n| Button | ready |",
            },
          ],
        },
      },
    },
    {
      type: "turn/end",
      data: { turn: 1, reason: "complete" },
    },
  ],
};

const html = renderSessionHtml(snapshot);

assert.match(html, /^<!doctype html>/i, "document should be standalone HTML");
assert.ok(html.includes("&lt;script&gt;alert(&#39;title&#39;)&lt;/script&gt;"), "title must be escaped");
assert.ok(!/<script/i.test(html), "no raw script element may survive");
assert.ok(!html.includes("<img"), "no raw user-authored image element may survive");
assert.ok(!html.includes("SECRET CONTEXT"), "context messages must not be exported as user messages");
assert.ok(html.includes("Working notes"), "intermediate assistant activity should be collapsible");
assert.ok(html.includes("<strong>note</strong>"), "bold should render");
assert.ok(html.includes("&lt;svg onload=alert(1)&gt;"), "tool names must be escaped");
assert.ok(html.includes("Final answer with"), "final assistant message should render");
assert.ok(html.includes('<a href="https://example.com"'), "safe links should render");
assert.ok(html.includes("<code>code</code>"), "inline code should render");
assert.ok(html.includes("console.log(1)"), "tool output should be preserved");
assert.ok(html.includes("<table>"), "tables should render");
assert.ok(html.includes('<th class="align-center">Status</th>'), "table alignment should render");
assert.ok(html.includes("1 turn"), "turn counter should be present");

const empty = renderSessionHtml({ session: { id: "empty" }, events: [] });
assert.ok(empty.includes("Untitled Session"), "missing title should fall back");
assert.ok(empty.includes("No committed messages"), "empty Session should explain itself");
assert.ok(!/<script/i.test(empty), "empty document must not add scripts");

console.log("render.test.mjs: all assertions passed");
