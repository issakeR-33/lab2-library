import type { Book } from '../models/Book';
import type { User } from '../models/User';
import type { LibraryService } from '../services/LibraryService';
import { MAX_BORROWED_BOOKS } from '../services/LibraryService';
import type { NotificationService } from '../services/NotificationService';
import { paginate } from '../utils/pagination';
import { createBookForm } from './components/BookForm';
import { renderBookList } from './components/BookList';
import { createCard } from './components/Card';
import { renderPagination } from './components/Pagination';
import { createUserForm } from './components/UserForm';
import { renderUserList } from './components/UserList';
import { h } from './dom';

/** Кореневе подання: збирає сторінку з компонентів і перемальовує списки після змін. */
export class App {
  private readonly root: HTMLElement;
  private readonly service: LibraryService;
  private readonly notifications: NotificationService;

  private searchQuery = '';
  private bookPage = 1;
  private userPage = 1;

  private readonly bookList = h('div');
  private readonly bookPagination = h('div');
  private readonly userList = h('div');
  private readonly userPagination = h('div');

  constructor(root: HTMLElement, service: LibraryService, notifications: NotificationService) {
    this.root = root;
    this.service = service;
    this.notifications = notifications;
  }

  mount(): void {
    const refresh = (): void => this.refresh();

    this.root.replaceChildren(
      h('h1', { className: 'text-center fw-bold my-3', text: 'Система Управління Бібліотекою' }),
      createBookForm(this.service, refresh),
      createUserForm(this.service, refresh),
      this.createBooksCard(),
      createCard('Список Користувачів', [this.userList, this.userPagination]),
    );
    this.refresh();
  }

  private createBooksCard(): HTMLElement {
    const search = h('input', {
      className: 'form-control mb-3',
      attrs: { type: 'search', placeholder: 'Пошук за назвою або автором', autocomplete: 'off' },
    });
    search.addEventListener('input', () => {
      this.searchQuery = search.value;
      this.bookPage = 1;
      this.refresh();
    });

    return createCard('Список Книг', [search, this.bookList, this.bookPagination]);
  }

  private refresh(): void {
    const books = paginate(this.service.searchBooks(this.searchQuery), this.bookPage);
    this.bookPage = books.page;
    renderBookList(this.bookList, books.items, {
      onBorrow: (book) => this.borrow(book),
      onReturn: (book) => this.giveBack(book),
      onDelete: (book) => {
        this.service.removeBook(book.id);
        this.refresh();
      },
      borrowerName: (book) =>
        book.borrowedBy === null ? undefined : this.service.getUser(book.borrowedBy)?.name,
    });
    renderPagination(this.bookPagination, books.page, books.totalPages, (page) => {
      this.bookPage = page;
      this.refresh();
    });

    const users = paginate(this.service.getUsers(), this.userPage);
    this.userPage = users.page;
    renderUserList(this.userList, users.items, {
      onDelete: (user) => {
        this.service.removeUser(user.id);
        this.refresh();
      },
      borrowedCount: (user) => this.service.getBorrowedCount(user.id),
    });
    renderPagination(this.userPagination, users.page, users.totalPages, (page) => {
      this.userPage = page;
      this.refresh();
    });
  }

  private borrow(book: Book): void {
    void this.notifications.askUserId('Введіть ID користувача для позичення книги:', (value) => {
      const result = this.service.borrowBook(book.id, Number(value));

      if (result.ok) {
        this.refresh();
        void this.notifications.notify(
          `${book.describe()} has been borrowed by ${result.user.describe()}.`,
          'Зрозуміло!',
        );
        return null;
      }

      switch (result.reason) {
        case 'user-not-found':
          return 'Користувача з таким ID не знайдено';
        case 'limit-reached':
          void this.notifications.notify(this.limitMessage(this.service.getUser(Number(value))));
          return null;
        default:
          this.refresh();
          return 'Цю книгу вже позичено';
      }
    });
  }

  private giveBack(book: Book): void {
    if (this.service.returnBook(book.id)) {
      this.refresh();
      void this.notifications.notify(`${book.describe()} has been returned.`);
    }
  }

  private limitMessage(user: User | undefined): string {
    const who = user ? user.name : 'Користувач';
    return `${who} вже позичив максимальну кількість книг (${MAX_BORROWED_BOOKS}). Спершу поверніть одну з них.`;
  }
}
