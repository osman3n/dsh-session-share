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
    const CSS_TAG = "@osman3n/dsh-session-share/session-share.css";

    const EN = {
      "action.label": "Share the whole session as an HTML file",
      "toast.downloading": "Session download started.",
      "toast.failed": "Could not export this session. Try again.",
    };

    const ZH = {
      "action.label": "把整个会话分享为 HTML 文件",
      "toast.downloading": "会话下载已开始。",
      "toast.failed": "无法导出此会话，请重试。",
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
          d: "M8 1.75v7.5M5.25 4.5 8 1.75 10.75 4.5M3 8.5v4.25A1.25 1.25 0 0 0 4.25 14h7.5A1.25 1.25 0 0 0 13 12.75V8.5",
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

    const inject = ["slots", "locale"];

    function apply(ctx) {
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
    }

    return { inject, apply };
  },
});
