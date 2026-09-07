import { createRequire } from "node:module";
import { parseArgs } from "node:util";
import { startThemeEditorServer } from "@sebas-dv/shadcn-theme-editor-server";

const require = createRequire(import.meta.url);

function resolveOverlayScript(): string | undefined {
  try {
    return require.resolve("@sebas-dv/shadcn-theme-editor-overlay/global");
  } catch {
    return undefined;
  }
}

const HELP = `
shadcn-theme-editor — companion server for the live theme overlay

Usage:
  npx @sebas-dv/shadcn-theme-editor [options]

Options:
  -p, --port <n>     Port to listen on (default 7433)
      --root <dir>   Project root to scan/write (default: cwd)
      --path <file>  Force a specific theme CSS file (relative or absolute)
      --base <path>  API/asset mount prefix (default /__theme-editor__)
      --backup       Write a .bak copy before overwriting the CSS file
  -h, --help         Show this help

Then load the overlay in your app (dev only), e.g. Next.js:
  import { ThemeEditor } from "@sebas-dv/shadcn-theme-editor-react";
  <ThemeEditor apiBase="http://localhost:7433" />
`;

async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    process.stderr.write(
      "shadcn-theme-editor: Security error: companion server cannot and must not run in production (NODE_ENV=production).\n",
    );
    process.exit(1);
  }

  const { values } = parseArgs({
    options: {
      port: { type: "string", short: "p" },
      root: { type: "string" },
      path: { type: "string" },
      base: { type: "string" },
      backup: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });

  if (values.help) {
    process.stdout.write(HELP);
    return;
  }

  const server = await startThemeEditorServer({
    root: values.root ?? process.cwd(),
    cssPath: values.path,
    basePath: values.base,
    backup: values.backup ?? false,
    port: values.port ? Number(values.port) : undefined,
    overlayScriptPath: resolveOverlayScript(),
  });

  const scriptUrl = `${server.url}${server.basePath}/overlay.js`;
  const lines = [
    "",
    "  ● shadcn Theme Editor — companion running",
    `    health   ${server.url}${server.basePath}/api/health`,
    "",
    "  Drop-in for any page (dev only):",
    `    <script src="${scriptUrl}" data-api-base="${server.url}" defer></script>`,
    "",
    "  Or in a bundled entry / React:",
    `    import { mount } from "@sebas-dv/shadcn-theme-editor-overlay";`,
    `    mount({ apiBase: "${server.url}" });`,
    "",
    "  Press Ctrl+C to stop.",
    "",
  ];
  process.stdout.write(lines.join("\n"));

  const shutdown = async (): Promise<void> => {
    await server.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  process.stderr.write(`shadcn-theme-editor: ${String(error)}\n`);
  process.exit(1);
});
