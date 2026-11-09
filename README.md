# DSH Session Share

Download a whole Session as one self-contained HTML file and send it to anyone.
The recipient can open it in a browser without DSH, an account, a server, or an
internet connection. If they also install this plugin, they can import the file
back into DSH as a read-only chat view and continue it as a real Session.

> **Status: source published, package unpublished.** The GitHub repository is
> public at <https://github.com/osman3n/dsh-session-share>, but the package is
> not on npm and is not listed on `awesome-dsh-plugin.com` or `dsh-market`. It
> therefore has **0 stars** and no hub card. See
> [Publishing and stars](#publishing-and-stars).

## What it changes

Two controls, no changes to existing chat rendering:

1. A 28 px share icon in the action row under each finalized assistant message —
   immediately after **Copy** and before **Like / Dislike** and **Branch**.
2. A 28 px import icon in the Workspaces header, beside **Search**,
   **View options**, and **Add workspace**.

The share icon exports the **whole Session**, not just that one reply, so every
reply offers the same download. The import icon reads a DSH Session Share HTML
file and opens a read-only, chat-style transcript in the central panel. Merely
opening it does not create a Session, add anything to your history, or send the
imported text to a model. No other plugin is required.

The imported panel uses the same conversation width, right-aligned user
messages, plain assistant Markdown, and attachment cards as the normal chat.
Image and file attachments are shown by name, size, and type; their bytes are
not embedded in the shared HTML. Tool output stays in compact collapsible rows.

The imported panel has one explicit **Continue in a new chat** button. It creates
a real Session and appends the imported turns to that Session's log, so the next
message continues the conversation with the imported history in model context.
That action does send the imported text to the configured model; it asks for
confirmation first. A workspace selector next to the button chooses where the
new Session is created. It preselects the workspace whose path matches the
imported Session's `cwd`, when one exists, and otherwise uses the first
workspace shown by DSH.

## Install (suggested, not performed)

This repository is only the source. Installation is a separate, explicit step
for the person who wants the button:

1. Clone this repository, or use an existing checkout.
2. Open DSH's plugin manager for the current profile and install the bundle from
   the folder containing this README. On this machine that folder is
   `C:\Users\osman_lam\Projects\Basic\plugins\session-share`.
3. Reload or restart DSH if the plugin manager asks for it.

Do not install it merely to read this README. The built-in Session log export
already covers Markdown copy and ZIP download without any extra plugin.

## Use

### Share

1. Open a Session.
2. Click the share icon under any assistant reply.
3. The browser downloads `dsh-session-<session-id>.html`.
4. Send that file. The recipient can open it directly, or import it if they have
   this plugin.

### Import

1. Click the import icon in the Workspaces header, next to Search and View
   options.
2. Choose a `dsh-session-*.html` file produced by this plugin.
3. The transcript opens in a read-only panel. Use **Back to chat** to return.

Only the inert JSON block embedded in the file is read; imported HTML scripts are
never executed, remote assets are never loaded, and merely importing adds no
Session to your history.

To continue it, choose the destination workspace in the Continue row, read the
warning, and confirm. The plugin creates a new Session through the normal Host
controller (so it gets the normal workspace, agent, and persistence writer),
appends one completed turn per imported turn, and opens that Session. The
imported history is then visible in the normal chat and the next message you send
continues from it. The button does not silently send anything before you confirm.

If the file contains tool output, it is appended inside the corresponding
assistant turn with an explicit `[Imported tool output: …]` label. The plugin
does not fabricate tool-call ids or claim that a tool ran in the new Session.

The file is a static transcript: no JavaScript, no external styles, no fonts,
no images fetched from the network, and no calls back to DSH. It includes:

- the Session title and export metadata;
- each turn's user and final assistant messages;
- a collapsible "Working notes" section with intermediate assistant text and
  tool calls;
- tool arguments and results;
- attachment cards for images and files, with name/size/type metadata (the bytes
  themselves are not embedded).

## Privacy

The export contains the committed Session transcript, including tool
arguments, command output, file paths and anything else that was visible in the
Session. It can contain secrets. Review the HTML before sending it, and treat
the file with the same care as the original conversation.

The Host route is authenticated by DSH's Connection service. There is no public
endpoint and no upload: the browser downloads the file locally. The continuation
route is also authenticated and accepts only the small, validated transcript
payload; it never accepts a raw HTML page.

An imported transcript is untrusted input. Continuing it makes that text part of
the model's context, where it could contain prompt-injection attempts or a
forged conversation. The confirmation dialog exists for that reason. Do not
continue a file from someone you do not trust.

Do not enable this plugin in a profile that is exposed to people who should not
read the Sessions in it.

## Compatibility

Built against the current DSH Session event format, the
`conversation.chat.assistant-actions` slot, and the `main` keyed panel slot. The
share action uses a per-Session `inject(sessionId)` callback; the import action
uses the `layout` service to open a read-only panel without changing the current
Session. It uses:

- `sessionQuery.readSession()` on the Host;
- `connection.fetch.register()` for the authenticated routes;
- `sessionController.create()` plus the live `sessions` store to create the
  continuable Session, and `sessions.flush()` before handing the id back;
- the client `slots`, `locale`, `layout`, `uiWorkspace`, and `workspaces`
  services;
- `@deepseek-ai/dsh-client-ui-layout` and
  `@deepseek-ai/dsh-client-ui-workspace` as declared client dependencies.

No DSH client packages are imported at runtime. The renderer is dependency-free.
The import button finds the Workspaces header by its stable `_headerActions`
suffix, so a future DSH redesign could move or hide it; the rest of the feature
is slot-based.

## Recipient and translation

The recipient does **not** need this plugin, DSH, or any account to read the
downloaded HTML. Opening the file in a browser is enough.

Installing the same plugin on the recipient's machine adds the same share button
for their own Sessions **and** the Import button. With it they can open the
received file as a read-only chat view inside DSH. Importing does not translate
the transcript: the message text is preserved exactly as exported. Installing
the plugin only localizes its own buttons, notices, and labels (English and
Simplified Chinese) through DSH's `locale` service, so each person sees the DSH
controls in their own language.

To read the conversation in another language, use the browser's built-in
translation on the HTML file, or translate the text externally. The file is
ordinary selectable text, and the import panel deliberately does not rewrite the
original wording.

## Publishing and stars

The package is deliberately `"private": true` and prefixed `@osman3n/`. The
public repository already exists, so the remaining steps are:

1. Change `"private": true` to `"private": false`, then `npm publish` (the
   scope must exist and be accessible).
2. Add an entry to the hub's `data/plugins/` directory and open a PR following
   that repository's submission rules.
3. Wait for the hub's star refresh. The hub reads GitHub stars into
   `data/stars.json`; a newly submitted card has no stars until that refresh.

Being listed on the hub or in `dsh-market` is **not** a security review. A star
count is popularity, not an audit. Review any plugin's code before installing
it.

Until those steps happen, this plugin has **0 GitHub stars** and no hub card.

## Why not LiveShare?

DSH ships an experimental official LiveShare plugin, but it shares a **live**
Session through a separately deployed Liveshare server, with owner OAuth and
server-issued credentials. It is not a static transcript export and is not a
turnkey install. This plugin exists for the simpler case: send the history to
someone who was not there.

## Files

- `index.js` — Host plugin: authenticated `/api/session.share` and
  `/api/session.share/continue` routes, the standalone HTML renderer, and the
  embedded import payload.
- `client.js` — Browser plugin: per-response share action, Workspaces import
  button, read-only chat panel with a continue action, locale strings, and
  styles.
- `cordis.patch.yml` — bundle patch that inserts the plugin.
- `locale/` — package metadata for English and Simplified Chinese.
- `icon.svg` — plugin icon.
- `test/render.test.mjs` — renderer regression test (run with Node).
- `test/import-payload.test.mjs` — embedded-payload round-trip and injection
  test (run with Node).
- `test/host-route.test.mjs` — authenticated download route and error-path test.
- `test/continue-route.test.mjs` — continuation route, validation, event shape,
  title, and flush test.
- `test/client-smoke.html` — browser smoke test for the module wrapper, slot and
  panel registration, locale dictionaries, and rendered button.
