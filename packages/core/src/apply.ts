import postcss, { type AtRule, type Container, type Rule } from "postcss";
import { matchScope } from "./scope";
import type { TokenChange, TokenScope } from "./types";

export interface ApplyResult {
  css: string;
  applied: string[]; // `scope::name` keys that were updated
  missing: TokenChange[]; // changes with no matching declaration in the source
}

function keyOf(scope: TokenScope, name: string): string {
  return `${scope}::${name}`;
}

// Edits only the matched declarations via the PostCSS AST, so surrounding
// formatting, comments and order survive. Tokens not already present are
// reported in `missing` (we don't create new declarations).
export function applyChanges(css: string, changes: TokenChange[]): ApplyResult {
  if (changes.length === 0) {
    return { css, applied: [], missing: [] };
  }

  const root = postcss.parse(css);
  const index = new Map<string, TokenChange>();
  for (const change of changes) {
    index.set(keyOf(change.scope, change.name), change);
  }
  const appliedKeys = new Set<string>();

  const updateContainer = (container: Container, scope: TokenScope): void => {
    container.each((node) => {
      if (node.type !== "decl") return;
      if (!node.prop.startsWith("--")) return;
      const key = keyOf(scope, node.prop);
      const change = index.get(key);
      if (!change) return;
      node.value = change.value; // keeps raws.between (surrounding whitespace)
      appliedKeys.add(key);
    });
  };

  root.walkRules((rule: Rule) => {
    const scope = matchScope(rule.selector);
    if (scope) updateContainer(rule, scope);
  });

  root.walkAtRules("theme", (atRule: AtRule) => {
    updateContainer(atRule, "theme");
  });

  const missing = changes.filter((c) => !appliedKeys.has(keyOf(c.scope, c.name)));

  return {
    css: root.toString(),
    applied: [...appliedKeys],
    missing,
  };
}
