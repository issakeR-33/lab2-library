import { h } from '../dom';

export function createCard(title: string, content: Node[]): HTMLElement {
  return h('section', { className: 'card shadow-sm mb-3' }, [
    h('div', { className: 'card-body' }, [
      h('h2', { className: 'h4 fw-bold mb-3', text: title }),
      ...content,
    ]),
  ]);
}
