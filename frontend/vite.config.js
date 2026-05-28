import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ─── i18n JSX-runtime interceptor ────────────────────────────────────────────
// Wraps react/jsx-runtime (prod) and react/jsx-dev-runtime (dev) so that every
// string child and every translatable prop is passed through t() automatically.
// No component files need to be touched; just flip DEFAULT_LANGUAGE in
// src/i18n/translations.js.
const BYPASS_JSX     = "\0__real_react_jsx_runtime__";
const VIRTUAL_JSX    = "\0__i18n_react_jsx_runtime__";
const BYPASS_DEV     = "\0__real_react_jsx_dev_runtime__";
const VIRTUAL_DEV    = "\0__i18n_react_jsx_dev_runtime__";

const SHARED = `
import { t, DEFAULT_LANGUAGE } from "/src/i18n/translations.js";
const BN = DEFAULT_LANGUAGE === "BN";
const XL = new Set(["placeholder", "title", "aria-label", "aria-placeholder"]);
function xl(props) {
  if (!BN || props == null) return props;
  const n = { ...props };
  let hit = false;
  for (const k of XL) {
    if (typeof n[k] === "string") { n[k] = t(n[k]); hit = true; }
  }
  if (typeof props.children === "string") {
    n.children = t(props.children); hit = true;
  } else if (Array.isArray(props.children)) {
    n.children = props.children.map(c => typeof c === "string" ? t(c) : c);
    hit = true;
  }
  return hit ? n : props;
}
`;

function i18nJsxPlugin() {
  return {
    name: "i18n-jsx-runtime",
    enforce: "pre",
    async resolveId(id, importer) {
      if (id === BYPASS_JSX)
        return this.resolve("react/jsx-runtime", importer, { skipSelf: true });
      if (id === BYPASS_DEV)
        return this.resolve("react/jsx-dev-runtime", importer, { skipSelf: true });
      if (id === "react/jsx-runtime")     return VIRTUAL_JSX;
      if (id === "react/jsx-dev-runtime") return VIRTUAL_DEV;
    },
    load(id) {
      if (id === VIRTUAL_JSX) return `
import { jsx as _jsx, jsxs as _jsxs, Fragment } from ${JSON.stringify(BYPASS_JSX)};
${SHARED}
export const jsx  = BN ? (type, p, k)       => _jsx (type, xl(p), k) : _jsx;
export const jsxs = BN ? (type, p, k)       => _jsxs(type, xl(p), k) : _jsxs;
export { Fragment };
`;
      if (id === VIRTUAL_DEV) return `
import { jsxDEV as _jsxDEV, Fragment } from ${JSON.stringify(BYPASS_DEV)};
${SHARED}
export const jsxDEV = BN
  ? (type, p, k, s, src, self) => _jsxDEV(type, xl(p), k, s, src, self)
  : _jsxDEV;
export { Fragment };
`;
    },
  };
}

export default defineConfig({
  plugins: [i18nJsxPlugin(), react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://127.0.0.1:8001",
        changeOrigin: true,
      },
    },
  },
});
