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
      "import.workspace": "Workspace",
      "import.workspaceHint": "Choose where the new chat is created. Ungrouped is the default.",
      "import.ungrouped": "Ungrouped (default)",
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
      "import.workspace": "工作区",
      "import.workspaceHint": "选择新会话要创建在哪个工作区。默认是未分组。",
      "import.ungrouped": "未分组（默认）",
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
/* The shipped Workspaces header caps its action row at 60px, which fits only
   two 28px buttons. The import button is a third one, so the row needs its
   natural width while it is visible; the shipped hidden state still collapses
   it to zero during search. */
[class*="_sectionHeader"] [class*="_headerActions"]:not([class*="_headerActionsHidden"]) {
  max-width: none;
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
/* Native chat layout: right-aligned user bubble, plain assistant markdown,
   compact tool rows and the same file card used by the conversation view. */
.dsh-session-share-panel-inner {
  width: min(calc(var(--dsh-chat-content-width, 748px) + 32px), 100%);
  padding: 12px 16px 96px;
}
.dsh-session-share-panel-top {
  position: sticky;
  top: 0;
  z-index: 3;
  align-items: center;
  gap: 12px;
  margin: 0 -16px 14px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  background: var(--dsw-alias-bg-base, var(--dsw-alias-bg-l1, #ffffff));
}
.dsh-session-share-panel-title {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-session-share-panel-meta {
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 2px;
  overflow: hidden;
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
}
.dsh-session-share-panel-badge {
  flex: none;
  padding: 0 6px;
  font-size: 11px;
  line-height: 16px;
}
.dsh-session-share-panel-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}
.dsh-session-share-workspace {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  color: var(--dsw-alias-label-secondary, #656d76);
  font-size: 12px;
}
.dsh-session-share-workspace select {
  max-width: 220px;
  min-width: 0;
  border: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-bg-base, #ffffff);
  color: var(--dsw-alias-label-primary, #1f2328);
  padding: 4px 6px;
  font: inherit;
  font-size: 12px;
}
.dsh-session-share-notice {
  margin: 0 0 10px;
  border: none;
  border-radius: 0;
  background: transparent;
  padding: 0;
  font-size: 12px;
  line-height: 17px;
}
.dsh-session-share-turn {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 18px;
  border-top: none;
  padding: 0;
}
.dsh-session-share-msg {
  margin: 0;
}
.dsh-session-share-msg-user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.dsh-session-share-msg-assistant {
  align-self: stretch;
}
.dsh-session-share-role {
  display: none;
}
.dsh-session-share-text {
  max-width: 100%;
  font-size: var(--dsh-content-font-size, 14px);
  line-height: 1.65;
}
.dsh-session-share-msg-user .dsh-session-share-text {
  box-sizing: border-box;
  max-width: min(calc(var(--dsh-chat-content-width, 748px) * .702), 82%);
  border: .5px solid var(--dsw-alias-border-l2, #0000001f);
  border-left: .5px solid var(--dsw-alias-border-l2, #0000001f);
  border-radius: var(--dsw-radius-lg, 12px);
  background: var(--dsw-specific-input-major, var(--dsw-alias-bg-layer-2, #f6f8fa));
  padding: 8px 12px;
  white-space: pre-wrap;
}
.dsh-session-share-msg-assistant .dsh-session-share-text {
  white-space: normal;
}
.dsh-session-share-attachments {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  max-width: 100%;
}
.dsh-session-share-file {
  display: inline-flex;
  box-sizing: border-box;
  flex: 0 0 240px;
  width: 240px;
  min-height: 64px;
  align-items: center;
  gap: 10px;
  border: .5px solid var(--dsw-alias-border-l2, #0000001f);
  border-radius: var(--dsw-radius-lg, 12px);
  background: var(--dsw-specific-input-major, transparent);
  padding: 8px 12px;
}
.dsh-session-share-file-icon {
  display: grid;
  flex: none;
  width: 28px;
  height: 28px;
  place-items: center;
  color: var(--dsw-alias-label-tertiary, #656d76);
}
.dsh-session-share-file-icon svg {
  display: block;
  width: 22px;
  height: 22px;
}
.dsh-session-share-file-content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}
.dsh-session-share-file-name {
  overflow: hidden;
  color: var(--dsw-alias-label-primary, #1f2328);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-session-share-file-meta {
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, #00000073);
  font-size: 12px;
  line-height: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dsh-session-share-mention {
  border-radius: 4px;
  background: var(--dsw-alias-interactive-bg-hover, rgb(127 127 127 / 10%));
  color: var(--dsw-alias-label-primary, #1f2328);
  padding: 0 3px;
  font-size: 0.94em;
}
.dsh-session-share-md > :first-child {
  margin-top: 0;
}
.dsh-session-share-md > :last-child {
  margin-bottom: 0;
}
.dsh-session-share-md p {
  margin: 0 0 12px;
}
.dsh-session-share-md h1,
.dsh-session-share-md h2,
.dsh-session-share-md h3,
.dsh-session-share-md h4 {
  margin: 18px 0 8px;
  font-weight: 600;
  line-height: 1.35;
}
.dsh-session-share-md h1 { font-size: 20px; }
.dsh-session-share-md h2 { font-size: 17px; }
.dsh-session-share-md h3 { font-size: 15px; }
.dsh-session-share-md h4 { font-size: 14px; }
.dsh-session-share-md ul,
.dsh-session-share-md ol {
  margin: 0 0 12px;
  padding-left: 22px;
}
.dsh-session-share-md li {
  margin: 3px 0;
}
.dsh-session-share-md blockquote {
  margin: 0 0 12px;
  border-left: 3px solid var(--dsw-alias-border-l1, #d8dee4);
  color: var(--dsw-alias-label-secondary, #656d76);
  padding-left: 12px;
}
.dsh-session-share-md code {
  border-radius: 4px;
  background: var(--dsw-alias-bg-layer-2, rgb(127 127 127 / 10%));
  padding: 1px 4px;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.9em;
}
.dsh-session-share-md pre {
  margin: 0 0 12px;
  overflow: auto;
  border: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2, #f6f8fa);
  padding: 10px 12px;
}
.dsh-session-share-md pre code {
  background: transparent;
  padding: 0;
  font-size: 12px;
  line-height: 1.55;
}
.dsh-session-share-md table {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  margin: 0 0 12px;
  border-collapse: collapse;
  font-size: 13px;
}
.dsh-session-share-md th,
.dsh-session-share-md td {
  border: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  padding: 5px 8px;
  text-align: left;
  vertical-align: top;
}
.dsh-session-share-md th {
  background: var(--dsw-alias-bg-layer-2, #f6f8fa);
  font-weight: 600;
}
.dsh-session-share-md a {
  color: var(--dsw-alias-brand-primary, #4f6bed);
  text-decoration: none;
}
.dsh-session-share-md a:hover {
  text-decoration: underline;
}
.dsh-session-share-tool {
  margin: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  padding: 0;
}
.dsh-session-share-tool summary {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--dsw-alias-label-tertiary, #656d76);
  font-size: 12px;
  line-height: 20px;
}
.dsh-session-share-tool-name {
  color: var(--dsw-alias-label-secondary, #656d76);
}
.dsh-session-share-tool .dsh-session-share-pre {
  margin: 6px 0 2px;
  border: 1px solid var(--dsw-alias-border-l1, #d8dee4);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2, #f6f8fa);
  padding: 8px 10px;
}
@media (max-width: 640px) {
  .dsh-session-share-panel-inner {
    width: 100%;
    padding: 8px 12px 88px;
  }
  .dsh-session-share-panel-top {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin: 0 -12px 12px;
    padding: 8px 12px;
  }
  .dsh-session-share-panel-actions {
    justify-content: flex-start;
  }
  .dsh-session-share-workspace select {
    max-width: none;
    flex: 1;
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

    function normalizeAttachments(value) {
      if (!Array.isArray(value)) return [];
      return value.slice(0, 20).map((attachment) => {
        if (attachment === null || typeof attachment !== "object") return null;
        if (attachment.kind !== "image" && attachment.kind !== "file") return null;
        const name = asText(attachment.name) || "attachment";
        return {
          kind: attachment.kind,
          name,
          bytes: typeof attachment.bytes === "number" && Number.isFinite(attachment.bytes) && attachment.bytes >= 0
            ? Math.trunc(attachment.bytes)
            : null,
          mediaType: asText(attachment.mediaType) || null,
        };
      }).filter((attachment) => attachment !== null);
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
                attachments: segment.kind === "user" ? normalizeAttachments(segment.attachments) : [],
              };
            }
            return null;
          }).filter((segment) => segment !== null && (segment.kind === "tool" || segment.text.length > 0 || segment.attachments.length > 0)),
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
      const actions = findWorkspaceHeaderActions();
      if (actions === null) return;
      const existing = document.querySelector("[data-dsh-session-share-import]");
      if (existing !== null && existing.isConnected) {
        if (actions.lastElementChild !== existing) actions.appendChild(existing);
        return;
      }
      actions.appendChild(makeImportButton(layout, t));
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

    const EMPTY_WORKSPACES = { items: [] };

    function useWorkspaceSnapshot(workspaces) {
      const subscribe = React.useCallback(
        (listener) => {
          if (workspaces !== undefined && workspaces !== null && workspaces.list !== undefined && typeof workspaces.list.subscribe === "function") {
            return workspaces.list.subscribe(listener);
          }
          return () => {};
        },
        [workspaces],
      );
      const getSnapshot = React.useCallback(() => {
        if (workspaces !== undefined && workspaces !== null && workspaces.list !== undefined && typeof workspaces.list.getSnapshot === "function") {
          return workspaces.list.getSnapshot() ?? EMPTY_WORKSPACES;
        }
        return EMPTY_WORKSPACES;
      }, [workspaces]);
      return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    }

    function formatBytes(bytes) {
      if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function extensionOf(name) {
      const dot = name.lastIndexOf(".");
      return dot > 0 ? name.slice(dot + 1).toUpperCase().slice(0, 8) : "";
    }

    function FileGlyph(props) {
      return React.createElement(
        "svg",
        { viewBox: "0 0 20 20", "aria-hidden": "true", focusable: "false" },
        React.createElement("path", {
          d: props.image
            ? "M4.5 3.5h7l4 4v9h-11zM11.5 3.5v4h4M6.5 12.5l2-2 1.5 1.5 1.5-2 2 2.5"
            : "M5 2.75h6.25L15 6.5v10.75H5zM11.25 2.75V6.5H15M7.25 10h5.5M7.25 12.75h5.5",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }),
      );
    }

    function ImportedAttachments(props) {
      if (props.attachments.length === 0) return null;
      return React.createElement(
        "div",
        { className: "dsh-session-share-attachments" },
        props.attachments.map((attachment, index) => {
          const meta = [extensionOf(attachment.name), formatBytes(attachment.bytes), attachment.mediaType]
            .filter((part) => part.length > 0)
            .join(" ");
          return React.createElement(
            "span",
            {
              key: `${index}-${attachment.name}`,
              className: "dsh-session-share-file",
              title: attachment.name,
            },
            React.createElement(
              "span",
              { className: "dsh-session-share-file-icon" },
              React.createElement(FileGlyph, { image: attachment.kind === "image" }),
            ),
            React.createElement(
              "span",
              { className: "dsh-session-share-file-content" },
              React.createElement("span", { className: "dsh-session-share-file-name" }, attachment.name),
              meta.length > 0 ? React.createElement("span", { className: "dsh-session-share-file-meta" }, meta) : null,
            ),
          );
        }),
      );
    }

    function renderUserInline(text) {
      const parts = String(text).split(/(@(?:"[^"]+"|[^\s@]+))/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return React.createElement("span", { key: index, className: "dsh-session-share-mention" }, part);
        }
        return part;
      });
    }

    function renderInline(text, keyPrefix) {
      const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g;
      const nodes = [];
      let last = 0;
      let match;
      let index = 0;
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > last) nodes.push(text.slice(last, match.index));
        const token = match[0];
        if (token.startsWith("`")) {
          nodes.push(React.createElement("code", { key: `${keyPrefix}-c${index++}` }, token.slice(1, -1)));
        } else if (token.startsWith("**")) {
          nodes.push(React.createElement("strong", { key: `${keyPrefix}-b${index++}` }, token.slice(2, -2)));
        } else {
          const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(token);
          if (link !== null) {
            nodes.push(React.createElement("a", {
              key: `${keyPrefix}-a${index++}`,
              href: link[2],
              target: "_blank",
              rel: "noreferrer noopener",
            }, link[1]));
          } else {
            nodes.push(token);
          }
        }
        last = match.index + token.length;
      }
      if (last < text.length) nodes.push(text.slice(last));
      return nodes;
    }

    function splitTableRow(line) {
      return line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((cell) => cell.trim());
    }

    function renderMarkdown(text) {
      const lines = String(text).replace(/\r\n/g, "\n").split("\n");
      const blocks = [];
      let index = 0;

      while (index < lines.length) {
        const line = lines[index];
        if (line.trim().length === 0) {
          index += 1;
          continue;
        }

        if (/^```/.test(line)) {
          const code = [];
          index += 1;
          while (index < lines.length && !/^```/.test(lines[index])) {
            code.push(lines[index]);
            index += 1;
          }
          if (index < lines.length) index += 1;
          blocks.push(React.createElement(
            "pre",
            { key: `code-${blocks.length}` },
            React.createElement("code", null, code.join("\n")),
          ));
          continue;
        }

        const heading = /^(#{1,6})\s+(.*)$/.exec(line);
        if (heading !== null) {
          const level = Math.min(4, heading[1].length);
          blocks.push(React.createElement(`h${level}`, { key: `h-${blocks.length}` }, renderInline(heading[2], `h${blocks.length}`)));
          index += 1;
          continue;
        }

        if (/^\s*\|?\s*:?-{3,}/.test(line) && index > 0 && lines[index - 1].includes("|")) {
          // A table header was already consumed as a paragraph; handle it here
          // only when the parser starts at the delimiter (rare).
          index += 1;
          continue;
        }

        if (line.includes("|") && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) {
          const header = splitTableRow(line);
          index += 2;
          const rows = [];
          while (index < lines.length && lines[index].includes("|") && lines[index].trim().length > 0) {
            rows.push(splitTableRow(lines[index]));
            index += 1;
          }
          blocks.push(React.createElement(
            "table",
            { key: `t-${blocks.length}` },
            React.createElement("thead", null, React.createElement("tr", null, header.map((cell, cellIndex) =>
              React.createElement("th", { key: cellIndex }, renderInline(cell, `th${blocks.length}-${cellIndex}`)),
            ))),
            React.createElement("tbody", null, rows.map((row, rowIndex) =>
              React.createElement("tr", { key: rowIndex }, header.map((_, cellIndex) =>
                React.createElement("td", { key: cellIndex }, renderInline(row[cellIndex] ?? "", `td${blocks.length}-${rowIndex}-${cellIndex}`)),
              )),
            )),
          ));
          continue;
        }

        if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
          const ordered = /^\s*\d+\.\s+/.test(line);
          const items = [];
          while (index < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[index])) {
            items.push(lines[index].replace(/^\s*([-*+]|\d+\.)\s+/, ""));
            index += 1;
          }
          const ListTag = ordered ? "ol" : "ul";
          blocks.push(React.createElement(
            ListTag,
            { key: `l-${blocks.length}` },
            items.map((item, itemIndex) => React.createElement("li", { key: itemIndex }, renderInline(item, `li${blocks.length}-${itemIndex}`))),
          ));
          continue;
        }

        if (/^\s*>\s?/.test(line)) {
          const quoted = [];
          while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
            quoted.push(lines[index].replace(/^\s*>\s?/, ""));
            index += 1;
          }
          blocks.push(React.createElement("blockquote", { key: `q-${blocks.length}` }, renderInline(quoted.join("\n"), `q${blocks.length}`)));
          continue;
        }

        if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
          blocks.push(React.createElement("hr", { key: `hr-${blocks.length}` }));
          index += 1;
          continue;
        }

        const paragraph = [line];
        index += 1;
        while (index < lines.length && lines[index].trim().length > 0 && !/^(#{1,6})\s+|^```|^\s*([-*+]|\d+\.)\s+|^\s*>\s?/.test(lines[index])) {
          if (lines[index].includes("|") && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])) break;
          paragraph.push(lines[index]);
          index += 1;
        }
        blocks.push(React.createElement(
          "p",
          { key: `p-${blocks.length}` },
          renderInline(paragraph.join(" "), `p${blocks.length}`),
        ));
      }

      return React.createElement("div", { className: "dsh-session-share-md" }, blocks);
    }

    function ImportedMessage(props) {
      const isUser = props.kind === "user";
      const text = props.text.length > 0
        ? isUser
          ? React.createElement("div", { className: "dsh-session-share-text" }, renderUserInline(props.text))
          : React.createElement("div", { className: "dsh-session-share-text" }, renderMarkdown(props.text))
        : null;
      return React.createElement(
        "article",
        { className: `dsh-session-share-msg dsh-session-share-msg-${props.kind}` },
        isUser && props.attachments !== undefined && props.attachments.length > 0
          ? React.createElement(ImportedAttachments, { attachments: props.attachments })
          : null,
        text,
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
              text: segment.text,
              attachments: segment.attachments,
            });
          }
          if (segment.kind === "assistant") {
            return React.createElement(ImportedMessage, {
              key,
              kind: "assistant",
              text: segment.text,
              attachments: [],
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
      const workspaces = props.workspaces;
      const workspaceState = useWorkspaceSnapshot(workspaces);
      const workspaceItems = Array.isArray(workspaceState.items)
        ? workspaceState.items.filter((item) => item !== null && typeof item === "object" && typeof item.workspaceId === "string" && item.workspaceId.length > 0)
        : [];
      const workspaceKey = workspaceItems.map((item) => item.workspaceId).join("|");
      const [workspaceId, setWorkspaceId] = React.useState("");
      const [continuing, setContinuing] = React.useState(false);
      const dataSessionId = data === null ? "" : data.sessionId;

      React.useEffect(() => {
        setWorkspaceId("");
      }, [dataSessionId]);

      React.useEffect(() => {
        if (workspaceId.length === 0) return;
        if (!workspaceItems.some((item) => item.workspaceId === workspaceId)) setWorkspaceId("");
      }, [workspaceId, workspaceKey]);

      const continueInNewChat = async () => {
        if (data === null || continuing) return;
        if (uiWorkspace === undefined || typeof uiWorkspace.openSession !== "function") {
          showToast(t("import.continueFailed"), "error");
          return;
        }
        if (typeof window.confirm === "function" && !window.confirm(t("import.continueConfirm"))) return;

        setContinuing(true);
        try {
          const body = {
            format: IMPORT_FORMAT,
            version: IMPORT_VERSION,
            title: data.title,
            sessionId: data.sessionId,
            cwd: data.cwd,
            createdAt: data.createdAt,
            exportedAt: data.exportedAt,
            turns: data.turns,
          };
          if (workspaceId.length > 0) body.workspaceId = workspaceId;
          const response = await fetch(CONTINUE_ROUTE, {
            method: "POST",
            credentials: "same-origin",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
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
                "label",
                { className: "dsh-session-share-workspace", title: t("import.workspaceHint") },
                React.createElement("span", null, t("import.workspace")),
                React.createElement(
                  "select",
                  {
                    value: workspaceId,
                    disabled: continuing,
                    onChange: (event) => setWorkspaceId(event.target.value),
                  },
                  React.createElement("option", { value: "" }, t("import.ungrouped")),
                  workspaceItems.map((item) => React.createElement(
                    "option",
                    { key: item.workspaceId, value: item.workspaceId },
                    item.title || item.path || item.workspaceId,
                  )),
                ),
              ),
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

    const inject = ["slots", "locale", "layout", "uiWorkspace", "workspaces"];

    function apply(ctx) {
      const layout = typeof ctx.get === "function" ? ctx.get("layout") : Reflect.get(ctx, "layout");
      const uiWorkspace = typeof ctx.get === "function" ? ctx.get("uiWorkspace") : Reflect.get(ctx, "uiWorkspace");
      const workspaces = typeof ctx.get === "function" ? ctx.get("workspaces") : Reflect.get(ctx, "workspaces");

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
              inject: () => ({ layout, uiWorkspace, workspaces }),
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
