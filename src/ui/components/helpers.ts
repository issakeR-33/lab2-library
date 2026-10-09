import { h } from '../dom';

export function emptyMessage(text: string): HTMLElement {
  return h('p', { className: 'text-muted mb-0', text });
}

export function actionButton(
  label: string,
  variant: string,
  onClick: () => void,
): HTMLButtonElement {
  const button = h('button', {
    className: `btn btn-${variant} btn-sm`,
    text: label,
    attrs: { type: 'button' },
  });
  button.addEventListener('click', onClick);
  return button;
}
