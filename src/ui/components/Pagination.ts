import { h } from './dom';

/** Навігація за сторінками; для однієї сторінки нічого не показує. */
export function renderPagination(
  container: HTMLElement,
  page: number,
  totalPages: number,
  onChange: (page: number) => void,
): void {
  container.replaceChildren();
  if (totalPages <= 1) {
    return;
  }

  const list = h('ul', { className: 'pagination pagination-sm mb-0 mt-3' });

  const addItem = (label: string, target: number, disabled: boolean, active = false): void => {
    const link = h('button', {
      className: 'page-link',
      text: label,
      attrs: { type: 'button' },
    });
    link.addEventListener('click', () => onChange(target));
    const classes = ['page-item', disabled ? 'disabled' : '', active ? 'active' : ''];
    list.append(h('li', { className: classes.filter(Boolean).join(' ') }, [link]));
  };

  addItem('«', page - 1, page === 1);
  for (let number = 1; number <= totalPages; number++) {
    addItem(String(number), number, false, number === page);
  }
  addItem('»', page + 1, page === totalPages);

  container.append(h('nav', { attrs: { 'aria-label': 'Сторінки' } }, [list]));
}
