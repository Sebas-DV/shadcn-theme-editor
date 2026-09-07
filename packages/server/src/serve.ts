import { serve, type ServerType } from "@hono/node-server";
import { createThemeEditorApp, type ThemeEditorAppOptions } from "./app";

export const DEFAULT_PORT = 7433;

export interface StartServerOptions extends ThemeEditorAppOptions {
  port?: number;
  hostname?: string;
}

export interface RunningServer {
  server: ServerType;
  port: number;
  basePath: string;
  url: string;
  close: () => Promise<void>;
}

// Standalone companion (CLI / Next.js). CORS on by default for cross-origin apps.
export function startThemeEditorServer(
  options: StartServerOptions = {},
): Promise<RunningServer> {
  if (process.env.NODE_ENV === "production") {
    return Promise.reject(
      new Error(
        "[shadcn-theme-editor] Security error: Cannot start theme editor server in production. shadcn-theme-editor companion server is strictly prohibited when NODE_ENV=production.",
      ),
    );
  }

  const { app, basePath } = createThemeEditorApp({ cors: true, ...options });
  const port = options.port ?? DEFAULT_PORT;
  const hostname = options.hostname ?? "localhost";

  return new Promise((resolve) => {
    const server = serve({ fetch: app.fetch, port, hostname }, (info) => {
      resolve({
        server,
        port: info.port,
        basePath,
        url: `http://${hostname}:${info.port}`,
        close: () =>
          new Promise<void>((res, rej) =>
            server.close((err) => (err ? rej(err) : res())),
          ),
      });
    });
  });
}
