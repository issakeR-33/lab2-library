export interface ElementOptions {
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
}

export type Child = Node | string;

/** Створює DOM-елемент без innerHTML: уся розмітка будується програмно. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
  children: Child[] = [],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  for (const [name, value] of Object.entries(options.attrs ?? {})) {
    element.setAttribute(name, value);
  }
  children.forEach((child) => element.append(child));

  return element;
}
