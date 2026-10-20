import { fileURLToPath, URL } from "node:url";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Production builds get a Content-Security-Policy that only allows our own scripts and connections to
 * the configured backend. That limits what an injected script could load or exfiltrate. (Not applied in
 * dev, where Vite's hot reload needs inline scripts.)
 */
function contentSecurityPolicy(apiBaseUrl: string | undefined): Plugin {
  let apiOrigin = "";
  try {
    apiOrigin = apiBaseUrl ? new URL(apiBaseUrl).origin : "";
  } catch {
    // An invalid URL is reported by the app at startup; the policy just omits it.
  }

  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    `connect-src 'self' ${apiOrigin}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  return {
    name: "oxyvault-content-security-policy",
    apply: "build",
    transformIndexHtml: () => [
      { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: policy }, injectTo: "head-prepend" },
      { tag: "meta", attrs: { name: "referrer", content: "no-referrer" }, injectTo: "head-prepend" },
    ],
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react(), tailwindcss(), contentSecurityPolicy(env.VITE_API_BASE_URL)],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: false,
    },
  };
});
