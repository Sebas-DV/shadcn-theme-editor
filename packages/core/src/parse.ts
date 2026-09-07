import postcss, { type AtRule, type Container, type Rule } from "postcss";
import { categorize } from "./categorize";
import { resolveColor } from "./color";
import { matchScope } from "./scope";
import type { ThemeModel, ThemeToken, TokenScope } from "./types";

function collectDeclarations(
  container: Container,
  scope: TokenScope,
  out: ThemeToken[],
): void {
  container.each((node) => {
    if (node.type !== "decl") return;
    if (!node.prop.startsWith("--")) return;

    const rawValue = node.value.trim();
    const isReference = /var\(|calc\(/.test(rawValue);
    const category = categorize(node.prop, rawValue);

    const token: ThemeToken = {
      name: node.prop,
      scope,
      rawValue,
      category,
      isReference,
    };

    if (category === "color" && !isReference) {
      const { format, resolved } = resolveColor(rawValue);
      token.colorFormat = format;
      token.resolvedColor = resolved;
    }

    out.push(token);
  });
}

// Walk the :root, .dark and @theme blocks, collecting every `--*` declaration.
export function parseTheme(css: string): ThemeModel {
  const root = postcss.parse(css);
  const tokens: ThemeToken[] = [];
  let hasDarkMode = false;

  root.walkRules((rule: Rule) => {
    const scope = matchScope(rule.selector);
    if (!scope) return;
    if (scope === "dark") hasDarkMode = true;
    collectDeclarations(rule, scope, tokens);
  });

  root.walkAtRules("theme", (atRule: AtRule) => {
    collectDeclarations(atRule, "theme", tokens);
  });

  return { tailwindVersion: 4, tokens, hasDarkMode };
}
