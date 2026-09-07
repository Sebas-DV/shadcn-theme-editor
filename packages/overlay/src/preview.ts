import type { TokenScope } from "@sebas-dv/shadcn-theme-editor-core/browser";

// A stylesheet appended to the host <head> with real :root/.dark blocks, so the
// light/dark cascade is respected (inline styles would override both at once).
// Being last in the head, equal-specificity rules win over the source theme.
export class PreviewLayer {
  private readonly styleEl: HTMLStyleElement;
  private readonly light = new Map<string, string>();
  private readonly dark = new Map<string, string>();

  constructor(private readonly doc: Document = document) {
    this.styleEl = doc.createElement("style");
    this.styleEl.setAttribute("data-shadcn-theme-editor-preview", "");
    doc.head.appendChild(this.styleEl);
  }

  // `theme`-scope tokens go into :root — they apply in both modes.
  set(scope: TokenScope, name: string, value: string): void {
    (scope === "dark" ? this.dark : this.light).set(name, value);
    this.render();
  }

  clear(scope: TokenScope, name: string): void {
    (scope === "dark" ? this.dark : this.light).delete(name);
    this.render();
  }

  reset(): void {
    this.light.clear();
    this.dark.clear();
    this.render();
  }

  toCss(): string {
    return this.buildBlock(":root", this.light) + this.buildBlock(".dark", this.dark);
  }

  destroy(): void {
    this.styleEl.remove();
  }

  private buildBlock(selector: string, map: Map<string, string>): string {
    if (map.size === 0) return "";
    const decls = [...map].map(([name, value]) => `  ${name}: ${value};`).join("\n");
    return `${selector} {\n${decls}\n}\n`;
  }

  private render(): void {
    this.styleEl.textContent = this.toCss();
  }
}
