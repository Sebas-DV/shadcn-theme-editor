import {
  contrastRatio,
  oklchComponents,
  oklchFromComponents,
  toHex,
  wcagGrade,
  type ThemeModel,
  type ThemeToken,
  type TokenCategory,
  type TokenChange,
  type TokenScope,
} from "@sebas-dv/shadcn-theme-editor-core/browser";
import { createApi, type FileRef, type ThemeApi } from "./api";
import { clear, h } from "./dom";
import { PreviewLayer } from "./preview";
import { OVERLAY_CSS } from "./styles";

export const DEFAULT_STORAGE_KEY = "shadcn-theme-editor:minimized";

export interface OverlayOptions {
  apiBase?: string; // where the API lives; default same origin
  basePath?: string; // default /__theme-editor__
  autoOpen?: boolean; // open the panel instead of the launcher
  persistState?: boolean; // persist minimized state across page reloads (default true)
  storageKey?: string; // custom localStorage key (default shadcn-theme-editor:minimized)
}

type TabId = "color" | "radius" | "typography" | "shadow" | "spacing" | "other";

const TAB_LABELS: Record<TabId, string> = {
  color: "Colores",
  radius: "Radios",
  typography: "Tipografía",
  shadow: "Sombras",
  spacing: "Espaciado",
  other: "Otros",
};

const TAB_ORDER: TabId[] = [
  "color",
  "radius",
  "typography",
  "shadow",
  "spacing",
  "other",
];

const NUMERIC_UNIT = /^(-?[\d.]+)(rem|px|em)$/;

function tabOf(category: TokenCategory): TabId {
  if (category === "font" || category === "tracking") return "typography";
  if (
    category === "color" ||
    category === "radius" ||
    category === "shadow" ||
    category === "spacing"
  ) {
    return category;
  }
  return "other";
}

const keyOf = (scope: TokenScope, name: string): string => `${scope}::${name}`;

function splitKey(key: string): { scope: TokenScope; name: string } {
  const at = key.indexOf("::");
  return { scope: key.slice(0, at) as TokenScope, name: key.slice(at + 2) };
}

const fixed = (value: number, decimals: number): string => value.toFixed(decimals);

// The background/foreground counterpart of a token, if any.
function pairName(name: string): string | undefined {
  if (name === "--foreground") return "--background";
  if (name === "--background") return "--foreground";
  if (name.endsWith("-foreground")) return name.slice(0, -"-foreground".length);
  return `${name}-foreground`;
}

const gradeClass = (grade: string): string =>
  grade === "Fail" ? "bad" : grade === "AA Large" ? "warn" : "ok";

/** Hue-spectrum gradient stops for the H slider at a given L/C. */
function hueTrack(l: number, c: number): string {
  const stops: string[] = [];
  for (let hue = 0; hue <= 360; hue += 30) {
    stops.push(`oklch(${l} ${c} ${hue}) ${(hue / 360) * 100}%`);
  }
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

export class ThemeEditorOverlay {
  private readonly root: HTMLElement;
  private readonly api: ThemeApi;
  private readonly preview: PreviewLayer;
  private readonly hostRoot: HTMLElement;
  private readonly hadDarkClass: boolean;

  private model: ThemeModel | null = null;
  private file: FileRef | null = null;
  private mode: "light" | "dark" = "light";
  private tab: TabId = "color";
  private query = "";

  private readonly values = new Map<string, string>();
  private readonly original = new Map<string, string>();
  private readonly dirty = new Set<string>();
  private readonly openKeys = new Set<string>();
  private readonly contrastUpdaters = new Map<string, () => void>();

  private readonly persistState: boolean;
  private readonly storageKey: string;
  private _isMinimized = true;

  private listEl!: HTMLElement;
  private tabsEl!: HTMLElement;
  private statusEl!: HTMLElement;
  private applyBtn!: HTMLButtonElement;
  private fileEl!: HTMLElement;

  constructor(
    private readonly shadow: ShadowRoot,
    options: OverlayOptions = {},
  ) {
    const base = `${options.apiBase ?? ""}${options.basePath ?? "/__theme-editor__"}`;
    this.api = createApi(base);
    this.hostRoot = document.documentElement;
    this.hadDarkClass = this.hostRoot.classList.contains("dark");
    this.mode = this.hadDarkClass ? "dark" : "light";
    this.preview = new PreviewLayer(document);

    this.persistState = options.persistState ?? true;
    this.storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;

    const style = document.createElement("style");
    style.textContent = OVERLAY_CSS;
    shadow.appendChild(style);

    this.root = h("div", { class: "te-root" });
    shadow.appendChild(this.root);

    const savedMinimized = this.getPersistedMinimized();
    const shouldOpen =
      savedMinimized === false
        ? true
        : savedMinimized === true
          ? false
          : Boolean(options.autoOpen);

    if (shouldOpen) void this.open(false);
    else this.showLauncher();
  }

  public isMinimized(): boolean {
    return this._isMinimized;
  }

  private getPersistedMinimized(): boolean | null {
    if (!this.persistState || typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    try {
      const val = window.localStorage.getItem(this.storageKey);
      if (val === "true") return true;
      if (val === "false") return false;
      return null;
    } catch {
      return null;
    }
  }

  private setPersistedMinimized(minimized: boolean): void {
    if (!this.persistState || typeof window === "undefined" || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(this.storageKey, String(minimized));
    } catch {
      // Ignore storage errors in restricted sandboxes
    }
  }

  destroy(): void {
    this.preview.destroy();
    this.hostRoot.classList.toggle("dark", this.hadDarkClass);
    clear(this.shadow);
  }

  // ---------------------------------------------------------------- launcher

  private showLauncher(): void {
    this._isMinimized = true;
    clear(this.root);
    this.root.appendChild(
      h(
        "button",
        { class: "te-launcher", onclick: () => void this.open() },
        h("span", { class: "te-dot" }),
        h("span", { class: "te-launcher-label", text: "Theme Editor" }),
      ),
    );
  }

  public minimize(): void {
    this.setPersistedMinimized(true);
    this.showLauncher();
  }

  // ------------------------------------------------------------------- panel

  public async open(persist = true): Promise<void> {
    this._isMinimized = false;
    if (persist) {
      this.setPersistedMinimized(false);
    }
    this.buildPanel();
    await this.load();
  }

  private buildPanel(): void {
    clear(this.root);

    const header = h(
      "div",
      { class: "te-header" },
      h(
        "div",
        { class: "te-brand" },
        h("div", { class: "te-brand-mark" }),
        h("div", { class: "te-title", text: "Theme Editor" }),
      ),
      h("div", { class: "te-spacer" }),
      h(
        "div",
        { class: "te-seg" },
        this.segButton("light", "Claro"),
        this.segButton("dark", "Oscuro"),
      ),
      h("button", {
        class: "te-icon",
        title: "Re-escanear",
        text: "⟳",
        onclick: () => void this.load(),
      }),
      h("button", {
        class: "te-icon",
        title: "Minimizar",
        text: "—",
        onclick: () => this.minimize(),
      }),
      h("button", {
        class: "te-icon",
        title: "Cerrar",
        text: "✕",
        onclick: () => this.minimize(),
      }),
    );

    const search = h("input", {
      class: "te-search",
      type: "search",
      placeholder: "Buscar…",
      spellcheck: false,
    }) as HTMLInputElement;
    search.addEventListener("input", () => {
      this.query = search.value.trim().toLowerCase();
      this.renderList();
    });
    this.fileEl = h("div", { class: "te-file", text: "…" });
    const toolbar = h("div", { class: "te-toolbar" }, search, this.fileEl);

    this.tabsEl = h("div", { class: "te-tabs" });
    this.listEl = h("div", { class: "te-list" });

    this.statusEl = h("div", { class: "te-status" });
    this.applyBtn = h("button", {
      class: "te-btn",
      text: "Aplicar",
      disabled: true,
      onclick: () => void this.apply(),
    }) as HTMLButtonElement;

    const footer = h(
      "div",
      { class: "te-footer" },
      this.statusEl,
      h("button", {
        class: "te-icon",
        text: "⧉",
        title: "Copiar CSS de cambios",
        onclick: () => void this.copyCss(),
      }),
      h("button", {
        class: "te-icon",
        text: "↺",
        title: "Descartar cambios",
        onclick: () => this.resetAll(),
      }),
      this.applyBtn,
    );

    this.root.appendChild(
      h(
        "div",
        { class: "te-panel" },
        header,
        toolbar,
        this.tabsEl,
        this.listEl,
        footer,
      ),
    );
    this.refreshFooter();
  }

  private segButton(mode: "light" | "dark", label: string): HTMLButtonElement {
    return h("button", {
      class: this.mode === mode ? "is-active" : "",
      text: label,
      onclick: () => this.setMode(mode),
    }) as HTMLButtonElement;
  }

  private setMode(mode: "light" | "dark"): void {
    this.mode = mode;
    this.hostRoot.classList.toggle("dark", mode === "dark");
    this.root.querySelectorAll(".te-seg button").forEach((b) => {
      b.classList.toggle(
        "is-active",
        b.textContent === (mode === "dark" ? "Oscuro" : "Claro"),
      );
    });
    this.renderTabs();
    this.renderList();
  }

  // -------------------------------------------------------------------- data

  private async load(): Promise<void> {
    this.setStatus("Escaneando…");
    let res;
    try {
      res = await this.api.scan();
    } catch (error) {
      this.setStatus(`Servidor no disponible: ${String(error)}`, "err");
      return;
    }

    if (!res.ok || !res.model || !res.file) {
      this.fileEl.textContent = "";
      clear(this.listEl);
      this.listEl.appendChild(
        h(
          "div",
          { class: "te-empty" },
          h("strong", { text: "No se detectó un tema shadcn" }),
          "Necesita un CSS con tokens de Tailwind v4 (--background, --primary…).",
        ),
      );
      this.setStatus(res.error ?? "Sin archivo de tema.", "err");
      return;
    }

    this.model = res.model;
    this.file = res.file;
    this.values.clear();
    this.original.clear();
    this.dirty.clear();
    this.openKeys.clear();
    this.preview.reset();

    for (const token of res.model.tokens) {
      const key = keyOf(token.scope, token.name);
      this.values.set(key, token.rawValue);
      this.original.set(key, token.rawValue);
    }

    this.fileEl.textContent = res.file.relativePath;
    this.fileEl.title = res.file.relativePath;
    this.setStatus("Listo.", "ok");
    this.renderTabs();
    this.renderList();
  }

  // --------------------------------------------------------------- selectors

  private editableTokens(): ThemeToken[] {
    return this.model ? this.model.tokens.filter((t) => !t.isReference) : [];
  }

  private availableTabs(): TabId[] {
    const present = new Set<TabId>();
    for (const t of this.editableTokens()) present.add(tabOf(t.category));
    return TAB_ORDER.filter((id) => present.has(id));
  }

  private tokensForTab(tab: TabId): ThemeToken[] {
    const tokens = this.editableTokens().filter((t) => tabOf(t.category) === tab);
    if (tab === "color") {
      const scope: TokenScope = this.mode === "dark" ? "dark" : "root";
      return tokens.filter((t) => t.scope === scope);
    }
    return tokens;
  }

  private visibleTokens(): ThemeToken[] {
    const tokens = this.tokensForTab(this.tab);
    if (!this.query) return tokens;
    return tokens.filter((t) => t.name.toLowerCase().includes(this.query));
  }

  // --------------------------------------------------------------- rendering

  private renderTabs(): void {
    clear(this.tabsEl);
    const tabs = this.availableTabs();
    if (tabs.length && !tabs.includes(this.tab)) this.tab = tabs[0]!;
    for (const id of tabs) {
      const count = this.tokensForTab(id).length;
      this.tabsEl.appendChild(
        h(
          "button",
          {
            class: `te-tab${id === this.tab ? " is-active" : ""}`,
            onclick: () => {
              this.tab = id;
              this.renderTabs();
              this.renderList();
            },
          },
          h("span", { text: TAB_LABELS[id] }),
          h("span", { class: "te-tab-count", text: String(count) }),
        ),
      );
    }
  }

  private renderList(): void {
    clear(this.listEl);
    this.contrastUpdaters.clear();
    const tokens = this.visibleTokens();
    if (tokens.length === 0) {
      this.listEl.appendChild(
        h(
          "div",
          { class: "te-empty" },
          this.query ? "Sin coincidencias." : "Sin tokens aquí.",
        ),
      );
      return;
    }
    for (const token of tokens) {
      this.listEl.appendChild(
        token.category === "color" ? this.colorItem(token) : this.plainItem(token),
      );
    }
  }

  private colorItem(token: ThemeToken): HTMLElement {
    const key = keyOf(token.scope, token.name);
    const value = this.values.get(key) ?? token.rawValue;

    const swatchFill = h("span", {
      class: "te-swatch-fill",
      style: { background: value },
    });
    const contrast = h("span", { class: "te-contrast" });
    const head = h(
      "div",
      { class: "te-item-head" },
      h("button", { class: "te-swatch", type: "button" }, swatchFill),
      h("div", { class: "te-item-name", text: shortName(token.name) }),
      h("div", { class: "te-item-end" }, contrast, h("span", { class: "te-flag" })),
    );
    const item = h(
      "div",
      { class: `te-item${this.dirty.has(key) ? " is-dirty" : ""}` },
      head,
    );

    this.contrastUpdaters.set(key, () => this.paintContrast(contrast, token));
    this.paintContrast(contrast, token);

    let editor: HTMLElement | null = null;
    const ensureEditor = (): void => {
      if (editor) return;
      editor = this.colorEditor(token, { swatchFill, item });
      item.appendChild(editor);
    };
    head.addEventListener("click", () => {
      if (item.classList.toggle("is-open")) {
        ensureEditor();
        this.openKeys.add(key);
      } else {
        this.openKeys.delete(key);
      }
    });
    if (this.openKeys.has(key)) {
      item.classList.add("is-open");
      ensureEditor();
    }
    return item;
  }

  private colorEditor(
    token: ThemeToken,
    refs: { swatchFill: HTMLElement; item: HTMLElement },
  ): HTMLElement {
    const key = keyOf(token.scope, token.name);
    const value = this.values.get(key) ?? token.rawValue;
    const start = oklchComponents(value) ?? { l: 0, c: 0, h: 0, alpha: 1 };

    const pick = h("input", {
      class: "te-pick",
      type: "color",
      value: toHex(value) ?? "#000000",
    }) as HTMLInputElement;
    const field = h("input", {
      class: "te-input",
      type: "text",
      spellcheck: false,
      value,
    }) as HTMLInputElement;
    const reset = h("button", {
      class: "te-mini",
      type: "button",
      title: "Restaurar",
      text: "↺",
    });

    const mk = (
      label: string,
      min: number,
      max: number,
      step: number,
      val: number,
      dec: number,
    ) => {
      const range = h("input", {
        class: "te-range",
        type: "range",
        min: String(min),
        max: String(max),
        step: String(step),
        value: String(val),
      }) as HTMLInputElement;
      const output = h("output", { text: fixed(val, dec) });
      const row = h(
        "div",
        { class: "te-slider" },
        h("label", { text: label }),
        range,
        output,
      );
      return { range, output, row, dec };
    };
    const L = mk("L", 0, 1, 0.001, start.l, 3);
    const C = mk("C", 0, 0.4, 0.001, start.c, 3);
    const H = mk("H", 0, 360, 0.1, start.h, 1);
    const A = mk("α", 0, 1, 0.01, start.alpha, 2);
    const sliders = [L, C, H, A];

    const comps = () => ({
      l: Number(L.range.value),
      c: Number(C.range.value),
      h: Number(H.range.value),
      alpha: Number(A.range.value),
    });

    const paintTracks = (): void => {
      const { l, c, h: hue } = comps();
      L.range.style.setProperty(
        "--te-track",
        `linear-gradient(90deg, oklch(0 ${c} ${hue}), oklch(1 ${c} ${hue}))`,
      );
      C.range.style.setProperty(
        "--te-track",
        `linear-gradient(90deg, oklch(${l} 0 ${hue}), oklch(${l} 0.4 ${hue}))`,
      );
      H.range.style.setProperty("--te-track", hueTrack(l, c));
      A.range.style.setProperty(
        "--te-track",
        `linear-gradient(90deg, oklch(${l} ${c} ${hue} / 0), oklch(${l} ${c} ${hue}))`,
      );
    };

    const paint = (v: string, from: "slider" | "field" | "pick"): void => {
      refs.swatchFill.style.background = v;
      const parsed = oklchComponents(v);
      if (parsed && from !== "slider") {
        L.range.value = String(parsed.l);
        C.range.value = String(parsed.c);
        H.range.value = String(parsed.h);
        A.range.value = String(parsed.alpha);
      }
      for (const s of sliders)
        s.output.textContent = fixed(Number(s.range.value), s.dec);
      if (from !== "pick") pick.value = toHex(v) ?? "#000000";
      if (from !== "field") field.value = v;
      paintTracks();
    };

    const set = (v: string, from: "slider" | "field" | "pick"): void => {
      refs.item.classList.toggle("is-dirty", this.applyEdit(token, v));
      paint(v, from);
      this.refreshContrast(key); // this token and its bg/fg partner
    };

    for (const s of sliders) {
      s.range.addEventListener("input", () => {
        const { l, c, h: hue, alpha } = comps();
        set(oklchFromComponents(l, c, hue, alpha), "slider");
      });
    }
    // Native RGB picker: only react to genuine user interaction (isTrusted),
    // so it can never round-trip colors to sRGB on load.
    pick.addEventListener("input", (e) => {
      if (!e.isTrusted) return;
      const parsed = oklchComponents(pick.value);
      if (parsed)
        set(oklchFromComponents(parsed.l, parsed.c, parsed.h, parsed.alpha), "pick");
    });
    field.addEventListener("change", () => {
      const parsed = oklchComponents(field.value.trim());
      if (!parsed) return;
      const next = oklchFromComponents(parsed.l, parsed.c, parsed.h, parsed.alpha);
      set(next, "field");
      field.value = next; // normalize hex/other input to the canonical oklch
    });
    reset.addEventListener("click", () =>
      set(this.original.get(key) ?? value, "field"),
    );

    const editor = h(
      "div",
      { class: "te-editor" },
      h("div", { class: "te-pickrow" }, pick, field, reset),
      h("div", { class: "te-sliders" }, L.row, C.row, H.row, A.row),
    );
    editor.addEventListener("click", (e) => e.stopPropagation());
    paint(value, "slider");
    return editor;
  }

  private plainItem(token: ThemeToken): HTMLElement {
    const key = keyOf(token.scope, token.name);
    const value = this.values.get(key) ?? token.rawValue;

    const head = h(
      "div",
      { class: "te-item-head" },
      h("div", { class: "te-item-name", text: shortName(token.name) }),
      h("span", { class: "te-flag" }),
    );
    const item = h(
      "div",
      { class: `te-item te-plain${this.dirty.has(key) ? " is-dirty" : ""}` },
      head,
    );

    const raw = h("input", {
      class: "te-input",
      type: "text",
      spellcheck: false,
      value,
    }) as HTMLInputElement;
    const set = (v: string, syncRaw: boolean): void => {
      item.classList.toggle("is-dirty", this.applyEdit(token, v));
      if (syncRaw) raw.value = v;
    };

    const children: Node[] = [raw];
    const numeric = value.match(NUMERIC_UNIT);
    if (numeric) {
      const unit = numeric[2]!;
      const max = unit === "px" ? 64 : 4;
      const step = unit === "px" ? 1 : 0.025;
      const range = h("input", {
        class: "te-range",
        type: "range",
        min: "0",
        max: String(max),
        step: String(step),
        value: numeric[1]!,
        style: { marginTop: "10px" },
      }) as HTMLInputElement;
      range.addEventListener("input", () => set(`${range.value}${unit}`, true));
      raw.addEventListener("input", () => {
        const m = raw.value.match(NUMERIC_UNIT);
        if (m) range.value = m[1]!;
        set(raw.value, false);
      });
      children.push(range);
    } else {
      raw.addEventListener("input", () => set(raw.value, false));
    }

    item.appendChild(h("div", { class: "te-editor" }, ...children));
    return item;
  }

  // WCAG contrast of a token against its bg/fg partner, in the current scope.
  private paintContrast(el: HTMLElement, token: ThemeToken): void {
    const partner = pairName(token.name);
    const self = this.values.get(keyOf(token.scope, token.name));
    const other = partner ? this.values.get(keyOf(token.scope, partner)) : undefined;
    const ratio = self && other ? contrastRatio(self, other) : undefined;
    if (ratio === undefined) {
      el.hidden = true;
      return;
    }
    const grade = wcagGrade(ratio);
    el.hidden = false;
    el.textContent = ratio.toFixed(1);
    el.className = `te-contrast te-c-${gradeClass(grade)}`;
    el.title = `Contraste ${ratio.toFixed(2)} · ${grade} · vs ${shortName(partner!)}`;
  }

  private refreshContrast(key: string): void {
    this.contrastUpdaters.get(key)?.();
    const { scope, name } = splitKey(key);
    const partner = pairName(name);
    if (partner) this.contrastUpdaters.get(keyOf(scope, partner))?.();
  }

  // Shared state update: value map, dirty set, live preview, footer.
  private applyEdit(token: ThemeToken, value: string): boolean {
    const key = keyOf(token.scope, token.name);
    this.values.set(key, value);
    const dirty = value.trim() !== (this.original.get(key) ?? "").trim();
    if (dirty) {
      this.dirty.add(key);
      this.preview.set(token.scope, token.name, value);
    } else {
      this.dirty.delete(key);
      this.preview.clear(token.scope, token.name);
    }
    this.refreshFooter();
    return dirty;
  }

  // ---------------------------------------------------------------- actions

  private async apply(): Promise<void> {
    if (this.dirty.size === 0) return;
    const changes: TokenChange[] = [...this.dirty].map((key) => {
      const { scope, name } = splitKey(key);
      return { scope, name, value: this.values.get(key) ?? "" };
    });

    this.applyBtn.disabled = true;
    this.setStatus("Aplicando…");
    let res;
    try {
      res = await this.api.apply(changes, this.file?.path);
    } catch (error) {
      this.setStatus(`Error: ${String(error)}`, "err");
      this.refreshFooter();
      return;
    }
    if (!res.ok) {
      this.setStatus(res.error ?? "Fallo al aplicar.", "err");
      this.refreshFooter();
      return;
    }

    for (const key of this.dirty) this.original.set(key, this.values.get(key) ?? "");
    this.dirty.clear();
    this.listEl
      .querySelectorAll(".te-item.is-dirty")
      .forEach((el) => el.classList.remove("is-dirty"));
    const missing = res.missing?.length
      ? ` · ${res.missing.length} sin coincidencia`
      : "";
    this.setStatus(`✓ ${res.applied?.length ?? 0} escritos${missing}`, "ok");
    this.refreshFooter();
  }

  private async copyCss(): Promise<void> {
    const css = this.preview.toCss();
    if (!css) {
      this.setStatus("Sin cambios que copiar.");
      return;
    }
    try {
      await navigator.clipboard.writeText(css);
      this.setStatus("CSS copiado.", "ok");
    } catch {
      this.setStatus("No se pudo copiar.", "err");
    }
  }

  private resetAll(): void {
    for (const key of this.dirty) this.values.set(key, this.original.get(key) ?? "");
    this.dirty.clear();
    this.preview.reset();
    this.renderList();
    this.refreshFooter();
    this.setStatus("Cambios descartados.");
  }

  // ----------------------------------------------------------------- footer

  private refreshFooter(): void {
    const n = this.dirty.size;
    this.applyBtn.disabled = n === 0;
    this.applyBtn.textContent = n > 0 ? `Aplicar · ${n}` : "Aplicar";
  }

  private setStatus(text: string, kind: "ok" | "err" | "" = ""): void {
    this.statusEl.textContent = text;
    this.statusEl.className = `te-status${kind ? ` is-${kind}` : ""}`;
  }
}

function shortName(name: string): string {
  return name.replace(/^--/, "");
}
