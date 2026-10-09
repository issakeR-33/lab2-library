import type { Book } from '../models/Book';
import type { User } from '../models/User';
import { h } from './dom';

export interface BookListHandlers {
  onBorrow(book: Book): void;
  onReturn(book: Book): void;
  onDelete(book: Book): void;
  borrowerName(book: Book): string | undefined;
}

export interface UserListHandlers {
  onDelete(user: User): void;
  borrowedCount(user: User): number;
}

function emptyMessage(text: string): HTMLElement {
  return h('p', { className: 'text-muted mb-0', text });
}

function actionButton(label: string, variant: string, onClick: () => void): HTMLButtonElement {
  const button = h('button', {
    className: `btn btn-${variant} btn-sm`,
    text: label,
    attrs: { type: 'button' },
  });
  button.addEventListener('click', onClick);
  return button;
}

export function renderBookList(
  container: HTMLElement,
  books: Book[],
  handlers: BookListHandlers,
): void {
  container.replaceChildren();
  if (books.length === 0) {
    container.append(emptyMessage('Книг не знайдено.'));
    return;
  }

  const list = h('ul', { className: 'list-group list-group-flush' });
  for (const book of books) {
    const title = h('span', { text: book.describe() });
    const borrower = handlers.borrowerName(book);
    const label = h('div', { className: 'me-3' }, [title]);
    if (borrower) {
      label.append(h('div', { className: 'text-muted small', text: `Позичив(ла): ${borrower}` }));
    }

    const main = book.isBorrowed
      ? actionButton('Повернути', 'warning', () => handlers.onReturn(book))
      : actionButton('Позичити', 'primary', () => handlers.onBorrow(book));
    const remove = actionButton('Видалити', 'outline-danger', () => handlers.onDelete(book));

    list.append(
      h(
        'li',
        { className: 'list-group-item d-flex justify-content-between align-items-center px-0' },
        [label, h('div', { className: 'd-flex gap-2 flex-shrink-0' }, [main, remove])],
      ),
    );
  }
  container.append(list);
}

export function renderUserList(
  container: HTMLElement,
  users: User[],
  handlers: UserListHandlers,
): void {
  container.replaceChildren();
  if (users.length === 0) {
    container.append(emptyMessage('Користувачів ще немає.'));
    return;
  }

  const list = h('ul', { className: 'list-group list-group-flush' });
  for (const user of users) {
    const count = handlers.borrowedCount(user);
    const label = h('div', { className: 'me-3' }, [h('span', { text: user.describe() })]);
    if (count > 0) {
      label.append(h('div', { className: 'text-muted small', text: `Позичено книг: ${count}` }));
    }

    list.append(
      h(
        'li',
        { className: 'list-group-item d-flex justify-content-between align-items-center px-0' },
        [label, actionButton('Видалити', 'outline-danger', () => handlers.onDelete(user))],
      ),
    );
  }
  container.append(list);
}
