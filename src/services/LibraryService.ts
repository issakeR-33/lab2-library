import { Book } from '../models/Book';
import { User } from '../models/User';
import type { BookData, Id, UserData } from '../types';
import { generateId } from '../utils/idGenerator';
import { Library } from './Library';
import type { Storage } from './Storage';

export const MAX_BORROWED_BOOKS = 3;

const BOOKS_KEY = 'books';
const USERS_KEY = 'users';

export interface NewBook {
  title: string;
  author: string;
  year: number;
}

export interface NewUser {
  name: string;
  email: string;
}

export type BorrowFailure =
  'book-not-found' | 'user-not-found' | 'already-borrowed' | 'limit-reached';

export type BorrowResult =
  { ok: true; book: Book; user: User } | { ok: false; reason: BorrowFailure };

export class LibraryService {
  private readonly books = new Library<Book>();
  private readonly users = new Library<User>();
  private readonly storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
    this.restore();
  }

  getUser(id: Id): User | undefined {
    return this.users.getById(id);
  }

  getBooks(): Book[] {
    return this.books.getAll();
  }

  getUsers(): User[] {
    return this.users.getAll();
  }

  addBook(input: NewBook): Book {
    const book = new Book(generateId(), input.title.trim(), input.author.trim(), input.year);
    this.books.add(book);
    this.persist();
    return book;
  }

  isEmailTaken(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    return this.users.search((user) => user.email.toLowerCase() === normalized).length > 0;
  }

  addUser(input: NewUser): User {
    if (this.isEmailTaken(input.email)) {
      throw new Error(`Користувач з email ${input.email} вже існує`);
    }
    const user = new User(generateId(), input.name.trim(), input.email.trim());
    this.users.add(user);
    this.persist();
    return user;
  }

  removeBook(id: Id): boolean {
    const removed = this.books.remove(id);
    if (removed) {
      this.persist();
    }
    return removed;
  }

  /** Видаляє користувача; усі книги, які він тримав, стають вільними. */
  removeUser(id: Id): boolean {
    const removed = this.users.remove(id);
    if (removed) {
      this.books.search((book) => book.borrowedBy === id).forEach((book) => book.giveBack());
      this.persist();
    }
    return removed;
  }

  searchBooks(query: string): Book[] {
    const normalized = query.trim().toLowerCase();
    if (normalized === '') {
      return this.getBooks();
    }
    return this.books.search(
      (book) =>
        book.title.toLowerCase().includes(normalized) ||
        book.author.toLowerCase().includes(normalized),
    );
  }

  getBorrowedCount(userId: Id): number {
    return this.books.search((book) => book.borrowedBy === userId).length;
  }

  borrowBook(bookId: Id, userId: Id): BorrowResult {
    const book = this.books.getById(bookId);
    if (!book) {
      return { ok: false, reason: 'book-not-found' };
    }
    const user = this.users.getById(userId);
    if (!user) {
      return { ok: false, reason: 'user-not-found' };
    }
    if (book.isBorrowed) {
      return { ok: false, reason: 'already-borrowed' };
    }
    if (this.getBorrowedCount(userId) >= MAX_BORROWED_BOOKS) {
      return { ok: false, reason: 'limit-reached' };
    }

    book.borrow(userId);
    this.persist();
    return { ok: true, book, user };
  }

  returnBook(bookId: Id): Book | undefined {
    const book = this.books.getById(bookId);
    if (!book || !book.isBorrowed) {
      return undefined;
    }
    book.giveBack();
    this.persist();
    return book;
  }

  private persist(): void {
    this.storage.save<BookData[]>(
      BOOKS_KEY,
      this.books.getAll().map((book) => book.toJSON()),
    );
    this.storage.save<UserData[]>(
      USERS_KEY,
      this.users.getAll().map((user) => user.toJSON()),
    );
  }

  private restore(): void {
    this.storage
      .load<BookData[]>(BOOKS_KEY, [])
      .forEach((data) => this.books.add(Book.fromJSON(data)));
    this.storage
      .load<UserData[]>(USERS_KEY, [])
      .forEach((data) => this.users.add(User.fromJSON(data)));
  }
}
