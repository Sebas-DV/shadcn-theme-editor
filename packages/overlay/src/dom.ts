type ElProps<K extends keyof HTMLElementTagNameMap> = Partial<
  Omit<HTMLElementTagNameMap[K], "style">
> & {
  class?: string;
  text?: string;
  style?: Partial<CSSStyleDeclaration>;
};

// Tiny hyperscript helper — DOM without a framework.
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: ElProps<K>,
  ...children: Array<Node | string | null | undefined>
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) {
    const { class: cls, text, style, ...rest } = props;
    if (cls !== undefined) el.className = cls;
    if (text !== undefined) el.textContent = text;
    if (style) Object.assign(el.style, style);
    Object.assign(el, rest);
  }
  for (const child of children) {
    if (child == null) continue;
    el.append(child);
  }
  return el;
}

export function clear(node: Node): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}
