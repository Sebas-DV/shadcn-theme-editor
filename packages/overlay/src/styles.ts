// Overlay CSS, scoped by the Shadow Root. Deliberately single-theme dark chrome
// that never depends on the host theme it edits; the light/dark toggle drives
// the HOST app, not this panel.
export const OVERLAY_CSS = `
:host { all: initial; }
*, *::before, *::after { box-sizing: border-box; }

.te-root {
  --te-ground: #0c0e14;
  --te-surface: #151823;
  --te-surface-2: #1c2130;
  --te-elevated: #232838;
  --te-line: #2a3040;
  --te-line-strong: #3a4256;
  --te-text: #e8eaf0;
  --te-muted: #8b93a7;
  --te-faint: #626a7e;
  --te-accent: #7c9bff;
  --te-accent-ink: #0b1020;
  --te-ok: #5fd39a;
  --te-warn: #e6b566;
  --te-danger: #f27a86;
  --te-shadow: 0 24px 64px -12px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.02);
  --te-mono: ui-monospace, "SF Mono", "Cascadia Code", "Segoe UI Mono", Menlo, monospace;
  --te-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  position: fixed; inset: auto 16px 16px auto; z-index: 2147483000;
  font-family: var(--te-sans); font-size: 13px; line-height: 1.45; color: var(--te-text);
  -webkit-font-smoothing: antialiased;
}

/* ------------------------------------------------------------------ launcher */
.te-launcher {
  display: inline-flex; align-items: center; gap: 9px; padding: 9px 14px 9px 11px;
  background: var(--te-surface); border: 1px solid var(--te-line); border-radius: 999px;
  color: var(--te-text); cursor: pointer; box-shadow: var(--te-shadow); user-select: none;
  transition: transform .12s ease, background .12s ease, border-color .12s ease;
}
.te-launcher:hover { background: var(--te-surface-2); border-color: var(--te-line-strong); transform: translateY(-1px); }
.te-launcher-label { font-size: 12.5px; font-weight: 550; letter-spacing: .01em; }
.te-dot {
  width: 15px; height: 15px; border-radius: 50%;
  background: conic-gradient(from 210deg, oklch(.72 .19 20), oklch(.82 .17 85), oklch(.86 .17 150), oklch(.7 .16 230), oklch(.68 .2 300), oklch(.72 .19 20));
  box-shadow: inset 0 0 0 2px rgba(0,0,0,.35);
}

/* --------------------------------------------------------------------- panel */
.te-panel {
  display: flex; flex-direction: column;
  width: 356px; max-width: calc(100vw - 32px); max-height: min(740px, calc(100vh - 32px));
  background: var(--te-ground); border: 1px solid var(--te-line); border-radius: 16px;
  box-shadow: var(--te-shadow); overflow: hidden;
}

.te-header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 12px 14px; flex-shrink: 0; }
.te-brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
.te-brand-mark {
  width: 22px; height: 22px; border-radius: 7px; flex: none;
  background: conic-gradient(from 210deg, oklch(.72 .19 20), oklch(.82 .17 85), oklch(.86 .17 150), oklch(.7 .16 230), oklch(.68 .2 300), oklch(.72 .19 20));
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.4);
}
.te-title { font-size: 13px; font-weight: 600; letter-spacing: -.01em; }
.te-spacer { flex: 1; }

.te-seg { display: inline-flex; background: var(--te-surface); border: 1px solid var(--te-line); border-radius: 9px; padding: 2px; gap: 2px; }
.te-seg button {
  border: 0; background: transparent; color: var(--te-muted); padding: 4px 11px; cursor: pointer;
  font-size: 11.5px; font-weight: 550; border-radius: 7px; font-family: var(--te-sans); transition: background .12s, color .12s;
}
.te-seg button:hover { color: var(--te-text); }
.te-seg button.is-active { background: var(--te-elevated); color: var(--te-text); box-shadow: 0 1px 2px rgba(0,0,0,.3); }

.te-icon { width: 28px; height: 28px; display: inline-grid; place-items: center; border: 0; background: transparent; color: var(--te-muted); cursor: pointer; border-radius: 8px; font-size: 15px; transition: background .12s, color .12s; flex-shrink: 0; }
.te-icon:hover { background: var(--te-surface-2); color: var(--te-text); }

.te-toolbar { display: flex; align-items: center; gap: 8px; padding: 0 12px 10px; flex-shrink: 0; }
.te-search { flex: 1; min-width: 0; background: var(--te-surface); border: 1px solid var(--te-line); border-radius: 9px; color: var(--te-text); padding: 7px 10px; font-size: 12px; font-family: var(--te-sans); }
.te-search::placeholder { color: var(--te-faint); }
.te-search:focus { outline: none; border-color: var(--te-line-strong); }
.te-file { font-family: var(--te-mono); font-size: 10.5px; color: var(--te-faint); max-width: 42%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: none; }

.te-tabs { display: flex; gap: 2px; padding: 0 8px; border-bottom: 1px solid var(--te-line); overflow-x: auto; scrollbar-width: none; flex-shrink: 0; min-height: 40px; position: relative; z-index: 1; }
.te-tabs::-webkit-scrollbar { display: none; }
.te-tab { position: relative; border: 0; background: transparent; color: var(--te-muted); padding: 9px 10px 11px; cursor: pointer; font-size: 12px; font-weight: 550; white-space: nowrap; font-family: var(--te-sans); transition: color .12s; flex-shrink: 0; }
.te-tab:hover { color: var(--te-text); }
.te-tab.is-active { color: var(--te-text); }
.te-tab.is-active::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: -1px; height: 2px; background: var(--te-accent); border-radius: 2px 2px 0 0; }
.te-tab-count { color: var(--te-faint); font-size: 10px; margin-left: 5px; font-variant-numeric: tabular-nums; }
.te-tab.is-active .te-tab-count { color: var(--te-accent); }

/* ---------------------------------------------------------------------- list */
.te-list { overflow-y: auto; padding: 6px; flex: 1 1 0; min-height: 0; scrollbar-width: thin; scrollbar-color: var(--te-line-strong) transparent; }
.te-list::-webkit-scrollbar { width: 10px; }
.te-list::-webkit-scrollbar-thumb { background: var(--te-line-strong); border-radius: 99px; border: 3px solid var(--te-ground); }

.te-item { border-radius: 10px; }
.te-item:hover { background: var(--te-surface); }
.te-item.is-open { background: var(--te-surface); }
.te-item-head { display: grid; grid-template-columns: 24px 1fr auto; gap: 11px; align-items: center; padding: 7px 9px; cursor: pointer; }
.te-swatch { width: 24px; height: 24px; border-radius: 7px; border: 0; padding: 0; position: relative; overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.14), inset 0 0 0 1px rgba(0,0,0,.25);
  background-image: linear-gradient(45deg,#2a2f3d 25%,transparent 25%),linear-gradient(-45deg,#2a2f3d 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2a2f3d 75%),linear-gradient(-45deg,transparent 75%,#2a2f3d 75%);
  background-size: 8px 8px; background-position: 0 0,0 4px,4px -4px,-4px 0; }
.te-swatch .te-swatch-fill { position: absolute; inset: 0; }
.te-item-name { font-family: var(--te-mono); font-size: 12px; color: var(--te-text); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.te-flag { width: 6px; height: 6px; border-radius: 50%; background: var(--te-accent); opacity: 0; transition: opacity .1s; }
.te-item.is-dirty .te-flag { opacity: 1; }
.te-item-end { display: flex; align-items: center; gap: 8px; }
.te-contrast { font-family: var(--te-mono); font-size: 10px; font-weight: 650; padding: 2px 6px; border-radius: 999px; font-variant-numeric: tabular-nums; cursor: help; }
.te-c-ok { color: var(--te-ok); background: color-mix(in oklab, var(--te-ok) 14%, transparent); }
.te-c-warn { color: var(--te-warn); background: color-mix(in oklab, var(--te-warn) 16%, transparent); }
.te-c-bad { color: var(--te-danger); background: color-mix(in oklab, var(--te-danger) 16%, transparent); }
[hidden] { display: none !important; }

/* -------------------------------------------------------------------- editor */
.te-editor { padding: 2px 9px 12px; display: none; }
.te-item.is-open .te-editor { display: block; }
.te-item.te-plain .te-editor { display: block; padding-top: 4px; }
.te-item.te-plain .te-item-head { grid-template-columns: 1fr auto; cursor: default; }

.te-pickrow { display: grid; grid-template-columns: 34px 1fr 30px; gap: 8px; align-items: center; }
.te-pick { -webkit-appearance: none; appearance: none; width: 34px; height: 30px; border: 0; border-radius: 8px; padding: 0; cursor: pointer; background: transparent; box-shadow: inset 0 0 0 1px rgba(255,255,255,.16), inset 0 0 0 1px rgba(0,0,0,.3); overflow: hidden; }
.te-pick::-webkit-color-swatch-wrapper { padding: 0; }
.te-pick::-webkit-color-swatch { border: none; border-radius: 8px; }
.te-pick::-moz-color-swatch { border: none; border-radius: 8px; }

.te-input { width: 100%; background: var(--te-surface-2); border: 1px solid var(--te-line); border-radius: 8px; color: var(--te-text); padding: 7px 9px; font-family: var(--te-mono); font-size: 11.5px; }
.te-input:focus { outline: none; border-color: var(--te-accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--te-accent) 22%, transparent); }
.te-mini { width: 30px; height: 30px; display: inline-grid; place-items: center; border: 1px solid var(--te-line); background: var(--te-surface-2); color: var(--te-muted); border-radius: 8px; cursor: pointer; font-size: 13px; }
.te-mini:hover { color: var(--te-text); border-color: var(--te-line-strong); }

.te-sliders { display: grid; gap: 8px; margin-top: 10px; }
.te-slider { display: grid; grid-template-columns: 12px 1fr 44px; gap: 9px; align-items: center; }
.te-slider > label { font-size: 10px; font-weight: 600; color: var(--te-muted); text-transform: uppercase; }
.te-slider > output { font-size: 10.5px; color: var(--te-muted); text-align: right; font-variant-numeric: tabular-nums; font-family: var(--te-mono); }
.te-range { -webkit-appearance: none; appearance: none; width: 100%; height: 14px; background: transparent; cursor: pointer; }
.te-range::-webkit-slider-runnable-track { height: 8px; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.35); background: var(--te-track, var(--te-surface-2)); }
.te-range::-moz-range-track { height: 8px; border-radius: 999px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.35); background: var(--te-track, var(--te-surface-2)); }
.te-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; margin-top: -3px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.5); }
.te-range::-moz-range-thumb { width: 14px; height: 14px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 0 1px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.5); }

.te-empty { color: var(--te-muted); text-align: center; padding: 40px 20px; font-size: 12.5px; }
.te-empty strong { color: var(--te-text); display: block; margin-bottom: 4px; font-size: 13px; }

/* -------------------------------------------------------------------- footer */
.te-footer { display: flex; align-items: center; gap: 6px; padding: 10px 10px 10px 12px; border-top: 1px solid var(--te-line); background: var(--te-surface); flex-shrink: 0; }
.te-status { flex: 1; font-size: 11px; color: var(--te-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.te-status.is-ok { color: var(--te-ok); }
.te-status.is-err { color: var(--te-danger); }
.te-btn { border: 1px solid var(--te-accent); background: var(--te-accent); color: var(--te-accent-ink); padding: 7px 14px; border-radius: 9px; cursor: pointer; font-size: 12px; font-weight: 650; font-family: var(--te-sans); transition: background .12s, opacity .12s; }
.te-btn:hover { background: color-mix(in oklab, var(--te-accent) 88%, white); }
.te-btn:disabled { opacity: .4; cursor: default; background: var(--te-surface-2); border-color: var(--te-line); color: var(--te-muted); }

@media (prefers-reduced-motion: reduce) { .te-root *, .te-root *::before, .te-root *::after { transition: none !important; } }
`;
