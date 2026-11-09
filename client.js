window.__ModuleLoader__.load({
  id: "@osman3n/dsh-session-share",
  factory(require) {
    /**
     * Session share — browser half.
     *
     * Adds one small share control to each finalized assistant message, in the
     * same action row as Copy / Like / Dislike. It does not change how any
     * message is rendered: it only asks the Host for the download route, then
     * hands that authenticated URL to the browser's download manager. The
     * downloaded HTML always contains the whole Session and needs no DSH to
     * open.
     */

    const React = require("react");

    const NS = "session-share";
    const SLOT = "conversation.chat.assistant-actions";
    const ID = "session-share";
    const ROUTE = "/api/session.share".slice(1);
    const CONTINUE_ROUTE = "/api/session.share/continue".slice(1);
    const CSS_TAG = "@osman3n/dsh-session-share/session-share.css";
    const PANEL_ID = "session-import";
    const IMPORT_DATA_ID = "dsh-session-share-data";
    const IMPORT_FORMAT = "dsh-session-share";
    const IMPORT_VERSION = 1;
    const MAX_IMPORT_BYTES = 25 * 1024 * 1024;
    const SHARE_ICON_PATH = "M8 1.75v7.5M5.25 4.5 8 1.75 10.75 4.5M3 8.5v4.25A1.25 1.25 0 0 0 4.25 14h7.5A1.25 1.25 0 0 0 13 12.75V8.5";
    const IMPORT_ICON_PATH = "M8 2.5v7.75M5.5 7.75 8 10.25 10.5 7.75M2.75 8.75v2.75A1.5 1.5 0 0 0 4.25 13h7.5a1.5 1.5 0 0 0 1.5-1.5V8.75";

    const EN = {
      "action.label": "Share the whole session as an HTML file",
      "toast.downloading": "Session download started.",
      "toast.failed": "Could not export this session. Try again.",
      "import.label": "Import a shared chat (HTML)",
      "import.loaded": "Shared chat imported. It is read-only.",
      "import.failed": "That file is not a DSH Session Share transcript.",
      "import.tooLarge": "That file is too large to import.",
      "import.readFailed": "Could not read that file.",
      "import.emptyTitle": "No shared chat imported",
      "import.emptyBody": "Use the import button in the Workspaces header, then choose a DSH Session Share HTML file.",
      "import.back": "Back to chat",
      "import.badge": "Read-only import",
      "import.notice": "This transcript is not part of your Sessions. Continue only if you trust the file: doing so creates a real Session and sends its text to a model.",
      "import.noMessages": "This transcript contains no displayable messages.",
      "import.continue": "Continue in a new chat",
      "import.continuing": "Opening…",
      "import.continueConfirm": "Create a real Session from this imported chat? Its text becomes model context and can influence future replies. Only continue if you trust the file.",
      "import.continueSuccess": "Imported chat opened as a new Session.",
      "import.continueFailed": "Could not open the imported chat as a Session.",
      "import.tool": "Tool",
      "import.arguments": "Arguments",
      "import.result": "Result",
      "import.unfinished": "unfinished",
      "import.error": "error",
      "import.done": "done",
      "import.you": "You",
      "import.assistant": "Assistant",
    };

    const ZH = {
      "action.label": "把整个会话分享为 HTML 文件",
      "toast.downloading": "会话下载已开始。",
      "toast.failed": "无法导出此会话，请重试。",
      "import.label": "导入分享的聊天（HTML）",
      "import.loaded": "已导入分享的聊天，仅供只读查看。",
      "import.failed": "该文件不是 DSH 会话分享记录。",
      "import.tooLarge": "该文件过大，无法导入。",
      "import.readFailed": "无法读取该文件。",
      "import.emptyTitle": "尚未导入分享的聊天",
      "import.emptyBody": "请使用工作区标题栏中的导入按钮，然后选择一个 DSH 会话分享 HTML 文件。",
      "import.back": "返回聊天",
      "import.badge": "只读导入",
      "import.notice": "此记录不属于你的会话。只有信任该文件时才继续：继续会创建真实会话，并将其文本发送给模型。",
      "import.noMessages": "此记录没有可显示的消息。",
      "import.continue": "在新会话中继续",
      "import.continuing": "正在打开…",
      "import.continueConfirm": "要从这段导入的聊天创建真实会话吗？其文本会成为模型上下文，并影响后续回复。只有信任该文件时才继续。",
      "import.continueSuccess": "已将导入的聊天作为新会话打开。",
      "import.continueFailed": "无法将导入的聊天作为会话打开。",
      "import.tool": "工具",
      "import.arguments": "参数",
      "import.result": "结果",
      "import.unfinished": "未完成",
      "import.error": "错误",
      "import.done": "完成",
      "import.you": "你",
      "import.assistant": "助手",
    };

    const CSS = `
.dsh-session-share {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: calc(28px + var(--dsh-content-font-delta, 0px));
  height: calc(28px + var(--dsh-content-font-delta, 0px));
  flex: none;
  margin: 0;
  padding: 6px;
  border: none;
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-tertiary, #656d76);
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;
}
.dsh-session-share:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(127 127 127 / 10%));
  color: var(--dsw-alias-label-secondary, #656d76);
}
.dsh-session-share:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4f6bed);
  outline-offset: 1px;
}
.dsh-session-share[aria-busy="true"] {
  cursor: progress;
  opacity: 0.55;
}
.dsh-session-share svg {
  width: calc(17px + var(--dsh-content-font-delta, 0px));
  height: calc(17px + var(--dsh-content-font-delta, 0px));
  display: block;
}
.dsh-session-share-toast {
  position: fixed;
  z-index: 2147483000;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  max-width: min(420px, calc(100vw - 32px));
  border: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  border-radius: 10px;
  background: var(--dsw-alias-bg-l2, #ffffff);
  color: var(--dsw-alias-label-primary, #1f2328);
  box-shadow: 0 8px 28px rgb(0 0 0 / 14%);
  padding: 10px 14px;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1.45;
  text-align: center;
}
.dsh-session-share-toast[data-tone="error"] {
  border-color: color-mix(in srgb, var(--dsw-alias-label-error, #cf222e) 45%, var(--dsw-alias-border-l1, #d8dee4));
}
.dsh-session-share-import-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  flex: none;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-secondary, #656d76);
  cursor: pointer;
}
.dsh-session-share-import-button:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(127 127 127 / 10%));
}
.dsh-session-share-import-button:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary, #4f6bed));
  outline-offset: -2px;
}
.dsh-session-share-import-button svg {
  display: block;
  width: 16px;
  height: 16px;
}
.dsh-session-share-panel {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: auto;
  background: var(--dsw-alias-bg-l1, #ffffff);
  color: var(--dsw-alias-label-primary, #1f2328);
}
.dsh-session-share-panel-inner {
  box-sizing: border-box;
  width: min(880px, 100%);
  margin: 0 auto;
  padding: 28px 28px 72px;
}
.dsh-session-share-panel-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.dsh-session-share-panel-title {
  min-width: 0;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.dsh-session-share-panel-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--dsw-alias-label-tertiary, #656d76);
  font-size: 12px;
  line-height: 18px;
}
.dsh-session-share-panel-badge {
  border: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  border-radius: 999px;
  padding: 1px 8px;
  color: var(--dsw-alias-label-secondary, #656d76);
}
.dsh-session-share-back {
  flex: none;
  border: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-primary, #1f2328);
  padding: 5px 10px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dsh-session-share-back:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(127 127 127 / 10%));
}
.dsh-session-share-panel-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}
.dsh-session-share-continue {
  border: 1px solid var(--dsw-alias-brand-primary, #4f6bed);
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-brand-primary, #4f6bed);
  color: #ffffff;
  padding: 6px 11px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dsh-session-share-continue:hover {
  filter: brightness(1.06);
}
.dsh-session-share-continue:disabled {
  cursor: progress;
  opacity: 0.6;
}
.dsh-session-share-continue:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4f6bed);
  outline-offset: 2px;
}
.dsh-session-share-notice {
  margin: 0 0 22px;
  border: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  border-radius: 8px;
  background: var(--dsw-alias-bg-l2, #ffffff);
  color: var(--dsw-alias-label-secondary, #656d76);
  padding: 9px 12px;
  font-size: 12px;
  line-height: 18px;
}
.dsh-session-share-turn {
  border-top: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  padding: 18px 0;
}
.dsh-session-share-turn:first-of-type {
  border-top: none;
}
.dsh-session-share-msg {
  margin: 0 0 14px;
}
.dsh-session-share-msg:last-child {
  margin-bottom: 0;
}
.dsh-session-share-role {
  margin-bottom: 5px;
  color: var(--dsw-alias-label-tertiary, #656d76);
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
}
.dsh-session-share-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.65;
}
.dsh-session-share-msg-user .dsh-session-share-text {
  border-left: 2px solid var(--dsw-alias-brand-primary, #4f6bed);
  padding-left: 12px;
}
.dsh-session-share-tool {
  margin: 10px 0;
  border: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  border-radius: 8px;
  background: var(--dsw-alias-bg-l2, #ffffff);
  padding: 8px 12px;
}
.dsh-session-share-tool summary {
  cursor: pointer;
  color: var(--dsw-alias-label-secondary, #656d76);
  font-size: 12px;
  line-height: 20px;
}
.dsh-session-share-tool-name {
  color: var(--dsw-alias-label-primary, #1f2328);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}
.dsh-session-share-pre {
  margin: 8px 0 0;
  max-height: 280px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--dsw-alias-label-secondary, #656d76);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
}
.dsh-session-share-tool-label {
  margin-top: 8px;
  color: var(--dsw-alias-label-tertiary, #656d76);
  font-size: 11px;
  line-height: 16px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.dsh-session-share-empty {
  display: flex;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 32px;
  color: var(--dsw-alias-label-secondary, #656d76);
  text-align: center;
}
.dsh-session-share-empty h2 {
  margin: 0 0 8px;
  color: var(--dsw-alias-label-primary, #1f2328);
  font-size: 18px;
}
.dsh-session-share-empty p {
  margin: 0;
  max-width: 420px;
  font-size: 13px;
  line-height: 1.6;
}
@media (max-width: 640px) {
  .dsh-session-share-panel-inner {
    padding: 20px 16px 56px;
  }
  .dsh-session-share-panel-top {
    flex-direction: column-reverse;
    gap: 10px;
  }
}
`;

    let toastTimer = null;

    function ensureCss() {
      if (document.querySelector(`style[data-plugin-css="${CSS_TAG}"]`) !== null) return;
      const tag = document.createElement("style");
      tag.dataset.plugin = "@osman3n/dsh-session-share";
      tag.dataset.pluginCss = CSS_TAG;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    function showToast(message, tone) {
      let node = document.querySelector(".dsh-session-share-toast");
      if (node === null) {
        node = document.createElement("div");
        node.className = "dsh-session-share-toast";
        node.setAttribute("role", "status");
        node.setAttribute("aria-live", "polite");
        document.body.appendChild(node);
      }
      node.dataset.tone = tone;
      node.textContent = message;
      if (toastTimer !== null) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        node.remove();
        toastTimer = null;
      }, 5000);
    }

    function filename(sessionId) {
      return `dsh-session-${String(sessionId).replace(/[^A-Za-z0-9_-]/g, "_")}.html`;
    }

    function downloadUrl(url, name) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }

    function ShareIcon() {
      return React.createElement(
        "svg",
        {
          viewBox: "0 0 16 16",
          "aria-hidden": "true",
          focusable: "false",
        },
        React.createElement("path", {
          d: SHARE_ICON_PATH,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.25",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }),
      );
    }

    /**
     * One assistant-message action. `messageId` is supplied by the slot;
     * `sessionId` is supplied by the slot's per-Session `inject` callback;
     * `t` comes from the slot's `locale` namespace.
     */
    function ShareAction(props) {
      const sessionId = props.sessionId;
      const t = typeof props.t === "function" ? props.t : (key) => EN[key] ?? key;
      const [busy, setBusy] = React.useState(false);

      const onClick = async () => {
        if (busy) return;
        setBusy(true);
        const url = `${ROUTE}?sessionId=${encodeURIComponent(String(sessionId))}`;
        try {
          const preflight = await fetch(url, { method: "HEAD", credentials: "same-origin" });
          if (!preflight.ok) throw new Error(`HTTP ${preflight.status}`);
          downloadUrl(url, filename(sessionId));
          showToast(t("toast.downloading"), "success");
        } catch (error) {
          console.error("[session-share] download failed", error);
          showToast(t("toast.failed"), "error");
        } finally {
          setBusy(false);
        }
      };

      return React.createElement(
        "button",
        {
          type: "button",
          className: "dsh-session-share",
          title: t("action.label"),
          "aria-label": t("action.label"),
          "aria-busy": busy ? "true" : "false",
          disabled: busy,
          onClick,
        },
        ShareIcon(),
      );
    }

    /* ----------------------------------------------------------------------
     * Imported chat
     * -------------------------------------------------------------------- */

    let importedChat = null;
    let fileInput = null;
    const importedListeners = new Set();

    function getImportedChat() {
      return importedChat;
    }

    function subscribeImported(listener) {
      importedListeners.add(listener);
      return () => importedListeners.delete(listener);
    }

    function publishImported(next) {
      importedChat = next;
      for (const listener of Array.from(importedListeners)) listener();
    }

    function useImportedChat() {
      return React.useSyncExternalStore(subscribeImported, getImportedChat, getImportedChat);
    }

    function asText(value) {
      return typeof value === "string" ? value : "";
    }

    function normalizeImportedData(payload) {
      if (payload === null || typeof payload !== "object") throw new Error("invalid payload");
      if (payload.format !== IMPORT_FORMAT || payload.version !== IMPORT_VERSION) {
        throw new Error("unsupported payload");
      }
      if (!Array.isArray(payload.turns)) throw new Error("invalid turns");

      const turns = payload.turns.map((turn) => {
        const segments = Array.isArray(turn?.segments) ? turn.segments : [];
        return {
          segments: segments.map((segment) => {
            if (segment === null || typeof segment !== "object") return null;
            if (segment.kind === "tool") {
              const result = segment.result !== null && typeof segment.result === "object"
                ? {
                    text: asText(segment.result.text),
                    isError: segment.result.isError === true,
                    reason: asText(segment.result.reason),
                  }
                : null;
              return {
                kind: "tool",
                name: asText(segment.name) || "tool",
                arguments: asText(segment.arguments),
                result,
              };
            }
            if (segment.kind === "user" || segment.kind === "assistant") {
              return {
                kind: segment.kind,
                text: asText(segment.text),
                toolCalls: segment.toolCalls === true,
              };
            }
            return null;
          }).filter((segment) => segment !== null && (segment.kind === "tool" || segment.text.length > 0)),
        };
      }).filter((turn) => turn.segments.length > 0);

      return {
        title: asText(payload.title) || "Untitled Session",
        sessionId: asText(payload.sessionId),
        cwd: asText(payload.cwd) || null,
        createdAt: asText(payload.createdAt) || null,
        exportedAt: asText(payload.exportedAt) || null,
        fileName: "",
        turns,
      };
    }

    function parseSharedHtml(text) {
      const document = new DOMParser().parseFromString(text, "text/html");
      const template = document.querySelector(`template#${IMPORT_DATA_ID}`);
      if (template === null) throw new Error("missing embedded transcript");
      const raw = template.content !== undefined ? template.content.textContent : template.textContent;
      let payload;
      try {
        payload = JSON.parse(raw ?? "");
      } catch {
        throw new Error("invalid embedded transcript");
      }
      return normalizeImportedData(payload);
    }

    function localeTranslator(ctx) {
      try {
        return ctx.locale.bind(NS);
      } catch {
        return (key) => EN[key] ?? key;
      }
    }

    async function importFile(file, layout, t) {
      if (file === null || typeof file !== "object") return;
      if (typeof file.size === "number" && file.size > MAX_IMPORT_BYTES) {
        showToast(t("import.tooLarge"), "error");
        return;
      }
      let text;
      try {
        text = await file.text();
      } catch (error) {
        console.error("[session-share] could not read import file", error);
        showToast(t("import.readFailed"), "error");
        return;
      }

      let data;
      try {
        data = parseSharedHtml(text);
      } catch (error) {
        console.error("[session-share] could not parse import file", error);
        showToast(t("import.failed"), "error");
        return;
      }

      data.fileName = asText(file.name);
      publishImported(data);
      if (layout !== undefined && typeof layout.selectPanel === "function") {
        layout.selectPanel(PANEL_ID);
      }
      showToast(t("import.loaded"), "success");
    }

    function ensureFileInput(layout, t) {
      if (fileInput !== null && fileInput.isConnected) return fileInput;
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".html,text/html";
      fileInput.hidden = true;
      fileInput.dataset.dshSessionShareFile = "";
      fileInput.addEventListener("change", () => {
        const file = fileInput !== null && fileInput.files !== null ? fileInput.files[0] : null;
        if (file !== undefined && file !== null) importFile(file, layout, t);
      });
      document.body.appendChild(fileInput);
      return fileInput;
    }

    function findWorkspaceHeaderActions() {
      const candidates = document.querySelectorAll('[class*="_headerActions"]');
      for (const actions of candidates) {
        const header = actions.closest('[class*="_sectionHeader"]');
        if (header === null) continue;
        if (header.querySelector('input[type="text"]') === null) continue;
        if (actions.children.length === 0) continue;
        return actions;
      }
      return null;
    }

    function makeImportButton(layout, t) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dsh-session-share-import-button";
      button.dataset.dshSessionShareImport = "";
      button.title = t("import.label");
      button.setAttribute("aria-label", t("import.label"));
      button.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="' + IMPORT_ICON_PATH + '" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      button.addEventListener("click", () => {
        const input = ensureFileInput(layout, t);
        input.value = "";
        input.click();
      });
      return button;
    }

    function ensureImportButton(layout, t) {
      const existing = document.querySelector("[data-dsh-session-share-import]");
      if (existing !== null && existing.isConnected) return;
      const actions = findWorkspaceHeaderActions();
      if (actions === null) return;
      actions.insertBefore(makeImportButton(layout, t), actions.firstChild);
    }

    function startImportButton(ctx, layout) {
      const t = localeTranslator(ctx);
      let frame = 0;
      const schedule = () => {
        if (frame !== 0) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          ensureImportButton(layout, t);
        });
      };
      const observer = new MutationObserver(schedule);
      observer.observe(document.body, { childList: true, subtree: true });
      const interval = setInterval(schedule, 1000);
      schedule();
      return () => {
        observer.disconnect();
        clearInterval(interval);
        if (frame !== 0) cancelAnimationFrame(frame);
        const button = document.querySelector("[data-dsh-session-share-import]");
        if (button !== null) button.remove();
        if (fileInput !== null) {
          fileInput.remove();
          fileInput = null;
        }
      };
    }

    function ImportedMessage(props) {
      return React.createElement(
        "article",
        { className: `dsh-session-share-msg dsh-session-share-msg-${props.kind}` },
        React.createElement("div", { className: "dsh-session-share-role" }, props.role),
        React.createElement("div", { className: "dsh-session-share-text" }, props.text),
      );
    }

    function ImportedTool(props) {
      const tool = props.tool;
      const t = props.t;
      const status = tool.result === null
        ? t("import.unfinished")
        : tool.result.isError
          ? t("import.error")
          : t("import.done");
      const resultText = tool.result === null ? "" : tool.result.text.length > 0 ? tool.result.text : tool.result.reason;
      return React.createElement(
        "details",
        { className: "dsh-session-share-tool" },
        React.createElement(
          "summary",
          null,
          React.createElement("span", { className: "dsh-session-share-tool-name" }, tool.name),
          ` · ${status}`,
        ),
        tool.arguments.length > 0
          ? React.createElement(
              React.Fragment,
              null,
              React.createElement("div", { className: "dsh-session-share-tool-label" }, t("import.arguments")),
              React.createElement("pre", { className: "dsh-session-share-pre" }, tool.arguments),
            )
          : null,
        resultText.length > 0
          ? React.createElement(
              React.Fragment,
              null,
              React.createElement("div", { className: "dsh-session-share-tool-label" }, t("import.result")),
              React.createElement("pre", { className: "dsh-session-share-pre" }, resultText),
            )
          : null,
      );
    }

    function ImportedTurn(props) {
      return React.createElement(
        "section",
        { className: "dsh-session-share-turn" },
        props.turn.segments.map((segment, index) => {
          const key = `${props.index}-${index}`;
          if (segment.kind === "user") {
            return React.createElement(ImportedMessage, {
              key,
              kind: "user",
              role: props.t("import.you"),
              text: segment.text,
            });
          }
          if (segment.kind === "assistant") {
            return React.createElement(ImportedMessage, {
              key,
              kind: "assistant",
              role: props.t("import.assistant"),
              text: segment.text,
            });
          }
          return React.createElement(ImportedTool, { key, tool: segment, t: props.t });
        }),
      );
    }

    function ImportedChatPanel(props) {
      const data = useImportedChat();
      const t = typeof props.t === "function" ? props.t : (key) => EN[key] ?? key;
      const layout = props.layout;
      const uiWorkspace = props.uiWorkspace;
      const [continuing, setContinuing] = React.useState(false);

      const continueInNewChat = async () => {
        if (data === null || continuing) return;
        if (uiWorkspace === undefined || typeof uiWorkspace.openSession !== "function") {
          showToast(t("import.continueFailed"), "error");
          return;
        }
        if (typeof window.confirm === "function" && !window.confirm(t("import.continueConfirm"))) return;

        setContinuing(true);
        try {
          const response = await fetch(CONTINUE_ROUTE, {
            method: "POST",
            credentials: "same-origin",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              format: IMPORT_FORMAT,
              version: IMPORT_VERSION,
              title: data.title,
              sessionId: data.sessionId,
              cwd: data.cwd,
              createdAt: data.createdAt,
              exportedAt: data.exportedAt,
              turns: data.turns,
            }),
          });
          let result = {};
          try {
            result = await response.json();
          } catch {
            // The status check below reports the failure.
          }
          if (!response.ok || typeof result.sessionId !== "string" || result.sessionId.length === 0) {
            throw new Error(typeof result.error === "string" ? result.error : "session continuation failed");
          }
          uiWorkspace.openSession(result.sessionId);
          showToast(t("import.continueSuccess"), "success");
        } catch (error) {
          console.error("[session-share] could not continue imported chat", error);
          showToast(t("import.continueFailed"), "error");
        } finally {
          setContinuing(false);
        }
      };

      if (data === null) {
        return React.createElement(
          "div",
          { className: "dsh-session-share-empty" },
          React.createElement(
            "div",
            null,
            React.createElement("h2", null, t("import.emptyTitle")),
            React.createElement("p", null, t("import.emptyBody")),
          ),
        );
      }

      const subtitleParts = [];
      if (data.fileName.length > 0) subtitleParts.push(data.fileName);
      if (data.sessionId.length > 0) subtitleParts.push(`Session ${data.sessionId}`);
      if (data.exportedAt !== null) subtitleParts.push(`Exported ${data.exportedAt}`);

      return React.createElement(
        "div",
        { className: "dsh-session-share-panel" },
        React.createElement(
          "div",
          { className: "dsh-session-share-panel-inner" },
          React.createElement(
            "div",
            { className: "dsh-session-share-panel-top" },
            React.createElement(
              "div",
              null,
              React.createElement("h1", { className: "dsh-session-share-panel-title" }, data.title),
              React.createElement(
                "div",
                { className: "dsh-session-share-panel-meta" },
                React.createElement("span", { className: "dsh-session-share-panel-badge" }, t("import.badge")),
                subtitleParts.length > 0 ? React.createElement("span", null, subtitleParts.join(" · ")) : null,
              ),
            ),
            React.createElement(
              "div",
              { className: "dsh-session-share-panel-actions" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "dsh-session-share-continue",
                  disabled: continuing,
                  onClick: continueInNewChat,
                },
                continuing ? t("import.continuing") : t("import.continue"),
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "dsh-session-share-back",
                  onClick: () => {
                    if (layout !== undefined && typeof layout.selectPanel === "function") layout.selectPanel(null);
                  },
                },
                t("import.back"),
              ),
            ),
          ),
          React.createElement("p", { className: "dsh-session-share-notice" }, t("import.notice")),
          data.turns.length === 0
            ? React.createElement("p", { className: "dsh-session-share-notice" }, t("import.noMessages"))
            : data.turns.map((turn, index) =>
                React.createElement(ImportedTurn, { key: String(index), turn, index, t }),
              ),
        ),
      );
    }

    const inject = ["slots", "locale", "layout", "uiWorkspace"];

    function apply(ctx) {
      const layout = typeof ctx.get === "function" ? ctx.get("layout") : Reflect.get(ctx, "layout");
      const uiWorkspace = typeof ctx.get === "function" ? ctx.get("uiWorkspace") : Reflect.get(ctx, "uiWorkspace");

      ctx.effect(() => {
        ensureCss();
        return () => {
          const tag = document.querySelector(`style[data-plugin-css="${CSS_TAG}"]`);
          if (tag !== null) tag.remove();
        };
      }, "session-share: stylesheet");

      ctx.effect(
        () => ctx.locale.register(NS, { en: EN, zh: ZH }),
        "session-share: dictionaries",
      );

      ctx.effect(
        () => ctx.slots.inject(SLOT, () =>
          ctx.slots.register(
            {
              name: SLOT,
              id: ID,
              order: 0,
              locale: NS,
              inject: (sessionId) => ({ sessionId }),
            },
            ShareAction,
          ),
        ),
        "session-share: assistant action",
      );

      ctx.effect(
        () => ctx.slots.inject("main", () =>
          ctx.slots.register(
            {
              name: "main",
              key: PANEL_ID,
              locale: NS,
              inject: () => ({ layout, uiWorkspace }),
            },
            ImportedChatPanel,
          ),
        ),
        "session-share: imported chat panel",
      );

      ctx.effect(() => startImportButton(ctx, layout), "session-share: import button");
    }

    return { inject, apply };
  },
});
