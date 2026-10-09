import type { User } from '../../models/User';
import { h } from '../dom';
import { actionButton, emptyMessage } from './helpers';

export interface UserListHandlers {
  onDelete(user: User): void;
  borrowedCount(user: User): number;
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
