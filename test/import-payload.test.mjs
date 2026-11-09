import assert from "node:assert/strict";
import { renderSessionHtml } from "../index.js";

const snapshot = {
  session: {
    id: "sess-import-1",
    cwd: "C:\\work\\demo",
    createdAt: "2026-11-09T02:00:00.000Z",
  },
  events: [
    { type: "session/title", data: { title: "Import <test> & demo" } },
    { type: "turn/start", data: { turn: 1 } },
    {
      type: "user/message",
      surfaceOp: "append",
      data: {
        source: { kind: "user" },
        content: [
          { type: "text", text: "Show me <b>this</b> & that" },
          { type: "file", name: "report.pdf", attachment: { name: "report.pdf", bytes: 2048, mediaType: "application/pdf" } },
          { type: "image", attachment: { name: "diagram.png", bytes: 512, mediaType: "image/png" } },
        ],
      },
    },
    {
      type: "assistant/message",
      surfaceOp: "append",
      data: {
        message: {
          content: [
            { type: "text", text: "Working on it." },
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
        name: "run",
        arguments: '{"command":"echo <ok>"}',
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
          content: [{ type: "text", text: "done & dusted" }],
        },
      },
    },
    {
      type: "assistant/message",
      surfaceOp: "append",
      data: { message: { content: [{ type: "text", text: "All done." }] } },
    },
    { type: "turn/end", data: { turn: 1, reason: "complete" } },
  ],
};

const html = renderSessionHtml(snapshot);
const match = /<template id="dsh-session-share-data">([\s\S]*?)<\/template>/.exec(html);
assert.ok(match, "embedded transcript template must exist");
const payload = JSON.parse(match[1]);

assert.equal(payload.format, "dsh-session-share");
assert.equal(payload.version, 1);
assert.equal(payload.title, "Import <test> & demo");
assert.equal(payload.sessionId, "sess-import-1");
assert.equal(payload.cwd, "C:\\work\\demo");
assert.equal(payload.turns.length, 1);
assert.equal(payload.turns[0].segments[0].kind, "user");
assert.match(payload.turns[0].segments[0].text, /<b>this<\/b>/);
assert.deepEqual(payload.turns[0].segments[0].attachments, [
  { kind: "file", name: "report.pdf", bytes: 2048, mediaType: "application/pdf" },
  { kind: "image", name: "diagram.png", bytes: 512, mediaType: "image/png" },
]);
assert.equal(payload.turns[0].segments[1].kind, "assistant");
assert.equal(payload.turns[0].segments[1].toolCalls, true);
assert.equal(payload.turns[0].segments[2].kind, "tool");
assert.equal(payload.turns[0].segments[2].result.text, "done & dusted");
assert.equal(payload.turns[0].segments[3].kind, "assistant");
assert.equal(payload.turns[0].segments[3].toolCalls, false);
assert.ok(!match[1].includes("</template>"), "escaped JSON must not close the template");
assert.ok(!/<script/i.test(html), "payload must not introduce a script element");
assert.ok(html.includes("Import &lt;test&gt; &amp; demo"), "visible title stays escaped");

console.log("import-payload.test.mjs: all assertions passed");
