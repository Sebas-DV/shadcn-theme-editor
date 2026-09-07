import type { IncomingMessage, ServerResponse } from "node:http";
import { getRequestListener } from "@hono/node-server";
import { createThemeEditorApp, type ThemeEditorAppOptions } from "./app";

export type ConnectMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: unknown) => void,
) => void;

// Connect-style middleware for Vite's `server.middlewares`. Requests outside
// `basePath` fall through to next().
export function createThemeEditorMiddleware(
  options: ThemeEditorAppOptions = {},
): ConnectMiddleware {
  if (process.env.NODE_ENV === "production") {
    return (_req, _res, next) => {
      next();
    };
  }

  const { app, basePath } = createThemeEditorApp(options);
  const listener = getRequestListener(app.fetch);

  return (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      next();
      return;
    }
    const url = req.url ?? "";
    if (!url.startsWith(basePath)) {
      next();
      return;
    }
    listener(req, res);
  };
}
