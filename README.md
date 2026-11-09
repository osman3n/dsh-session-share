# DSH Session Share

Download a whole Session as one self-contained HTML file and send it to anyone.
The recipient opens it in a browser. They do not need DSH, an account, a server,
or an internet connection.

> **Status: source published, package unpublished.** The GitHub repository is
> public at <https://github.com/osman3n/dsh-session-share>, but the package is
> not on npm and is not listed on `awesome-dsh-plugin.com` or `dsh-market`. It
> therefore has **0 stars** and no hub card. See
> [Publishing and stars](#publishing-and-stars).

## What it changes

One 28 px share icon in the action row under each finalized assistant message —
immediately after **Copy** and before **Like / Dislike** and **Branch**.

The icon exports the **whole Session**, not just that one reply, so every reply
offers the same download. It does **not** change message content, the composer,
the conversation layout, or any existing export behaviour. No other plugin is
required. The browser half only calls the plugin's own authenticated download
route; it does not inject content into the transcript.

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

1. Open a Session.
2. Click the share icon under any assistant reply.
3. The browser downloads `dsh-session-<session-id>.html`.
4. Send that file. The recipient opens it directly.

The file is a static transcript: no JavaScript, no external styles, no fonts,
no images fetched from the network, and no calls back to DSH. It includes:

- the Session title and export metadata;
- each turn's user and final assistant messages;
- a collapsible "Working notes" section with intermediate assistant text and
  tool calls;
- tool arguments and results;
- labels for image and file attachments (attachment bytes are not embedded).

## Privacy

The export contains the committed Session transcript, including tool
arguments, command output, file paths and anything else that was visible in the
Session. It can contain secrets. Review the HTML before sending it, and treat
the file with the same care as the original conversation.

The Host route is authenticated by DSH's Connection service. There is no public
endpoint and no upload: the browser downloads the file locally. Do not enable
this plugin in a profile that is exposed to people who should not read the
Sessions in it.

## Compatibility

Built against the current DSH Session event format and the
`conversation.chat.assistant-actions` slot, with a per-Session
`inject(sessionId)` callback. It uses:

- `sessionQuery.readSession()` on the Host;
- `connection.fetch.register()` for the authenticated route;
- the client `slots` and `locale` services.

No DSH client packages are imported. The renderer is dependency-free.

## Recipient and translation

The recipient does **not** need this plugin, DSH, or any account to read the
downloaded HTML. Opening the file in a browser is enough.

Installing the same plugin on the recipient's machine adds the same share
button for their own Sessions; it does not add a transcript viewer and does not
translate someone else's file. To read the file in another language, use the
browser's built-in translation (the HTML is ordinary selectable text), or keep
the original text and translate it externally.

The plugin's own button/tooltip text is localized (English and Simplified
Chinese) through DSH's `locale` service, so each person sees it in the language
of their DSH UI.

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

- `index.js` — Host plugin: authenticated `/api/session.share` route and the
  standalone HTML renderer.
- `client.js` — Browser plugin: per-response action, locale strings, styles.
- `cordis.patch.yml` — bundle patch that inserts the plugin.
- `locale/` — package metadata for English and Simplified Chinese.
- `icon.svg` — plugin icon.
- `test/render.test.mjs` — renderer regression test (run with Node).
- `test/host-route.test.mjs` — authenticated route and error-path test.
- `test/client-smoke.html` — browser smoke test for the module wrapper, slot
  registration, locale dictionaries, and rendered button.
