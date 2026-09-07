import type {
  DetectedCssFile,
  ThemeModel,
  TokenChange,
} from "@sebas-dv/shadcn-theme-editor-core/browser";

export interface FileRef {
  path: string;
  relativePath: string;
}

export interface ScanResponse {
  ok: boolean;
  file: FileRef | null;
  candidates: DetectedCssFile[];
  model: ThemeModel | null;
  css: string | null;
  error?: string;
}

export interface ApplyResponse {
  ok: boolean;
  file?: FileRef;
  applied?: string[];
  missing?: TokenChange[];
  wrote?: boolean;
  error?: string;
}

export interface ThemeApi {
  scan(path?: string): Promise<ScanResponse>;
  apply(changes: TokenChange[], path?: string): Promise<ApplyResponse>;
}

export function createApi(base: string): ThemeApi {
  return {
    async scan(path) {
      const url = new URL(`${base}/api/scan`, location.href);
      if (path) url.searchParams.set("path", path);
      const res = await fetch(url.toString(), {
        headers: { accept: "application/json" },
      });
      return (await res.json()) as ScanResponse;
    },
    async apply(changes, path) {
      const res = await fetch(`${base}/api/apply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ changes, path }),
      });
      return (await res.json()) as ApplyResponse;
    },
  };
}
