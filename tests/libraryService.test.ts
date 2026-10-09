import { expect } from 'chai';
import { LibraryService, MAX_BORROWED_BOOKS } from '../src/services/LibraryService';
import { Storage } from '../src/services/Storage';
import { MemoryBackend } from './helpers';

describe('LibraryService', () => {
  let backend: MemoryBackend;
  let service: LibraryService;

  const createService = (): LibraryService => new LibraryService(new Storage(backend));

  beforeEach(() => {
    backend = new MemoryBackend();
    service = createService();
  });

  describe('borrowing', () => {
    it('marks a book as borrowed by the user', () => {
      const book = service.addBook({ title: 'Code Complete', author: 'McConnell', year: 2004 });
      const user = service.addUser({ name: 'Артем', email: 'artem@example.com' });

      const result = service.borrowBook(book.id, user.id);

      expect(result.ok).to.equal(true);
      expect(book.isBorrowed).to.equal(true);
      expect(book.borrowedBy).to.equal(user.id);
    });

    it('does not lend an already borrowed book', () => {
      const book = service.addBook({ title: 'Code Complete', author: 'McConnell', year: 2004 });
      const first = service.addUser({ name: 'Артем', email: 'a@example.com' });
      const second = service.addUser({ name: 'Мартін', email: 'm@example.com' });
      service.borrowBook(book.id, first.id);

      expect(service.borrowBook(book.id, second.id)).to.deep.equal({
        ok: false,
        reason: 'already-borrowed',
      });
    });

    it('rejects an unknown user', () => {
      const book = service.addBook({ title: 'Code Complete', author: 'McConnell', year: 2004 });

      expect(service.borrowBook(book.id, 123)).to.deep.equal({
        ok: false,
        reason: 'user-not-found',
      });
    });

    it(`allows at most ${MAX_BORROWED_BOOKS} books per user`, () => {
      const user = service.addUser({ name: 'Артем', email: 'a@example.com' });
      const books = Array.from({ length: MAX_BORROWED_BOOKS + 1 }, (_, i) =>
        service.addBook({ title: `Book ${i}`, author: 'Author', year: 2000 }),
      );

      books.slice(0, MAX_BORROWED_BOOKS).forEach((book) => {
        expect(service.borrowBook(book.id, user.id).ok).to.equal(true);
      });

      const extra = books[MAX_BORROWED_BOOKS];
      expect(extra).to.not.equal(undefined);
      expect(service.borrowBook(extra!.id, user.id)).to.deep.equal({
        ok: false,
        reason: 'limit-reached',
      });
    });
  });

  describe('returning', () => {
    it('makes the book available again', () => {
      const book = service.addBook({ title: 'Code Complete', author: 'McConnell', year: 2004 });
      const user = service.addUser({ name: 'Артем', email: 'a@example.com' });
      service.borrowBook(book.id, user.id);

      const returned = service.returnBook(book.id);

      expect(returned).to.equal(book);
      expect(book.isBorrowed).to.equal(false);
    });

    it('returns undefined for a book that was not borrowed', () => {
      const book = service.addBook({ title: 'Code Complete', author: 'McConnell', year: 2004 });

      expect(service.returnBook(book.id)).to.equal(undefined);
    });
  });

  describe('deleting', () => {
    it('frees the books of a deleted user', () => {
      const book = service.addBook({ title: 'Code Complete', author: 'McConnell', year: 2004 });
      const user = service.addUser({ name: 'Артем', email: 'a@example.com' });
      service.borrowBook(book.id, user.id);

      service.removeUser(user.id);

      expect(book.isBorrowed).to.equal(false);
    });
  });

  describe('searching', () => {
    it('finds books by title or author, ignoring case', () => {
      service.addBook({ title: 'Clean Code', author: 'Robert Martin', year: 2008 });
      service.addBook({ title: 'Code Complete', author: 'Steve McConnell', year: 2004 });

      expect(service.searchBooks('MARTIN')).to.have.length(1);
      expect(service.searchBooks('code')).to.have.length(2);
      expect(service.searchBooks('')).to.have.length(2);
      expect(service.searchBooks('nothing')).to.have.length(0);
    });
  });

  describe('persistence', () => {
    it('restores books, users and borrowed state after a reload', () => {
      const book = service.addBook({ title: 'Code Complete', author: 'McConnell', year: 2004 });
      const user = service.addUser({ name: 'Артем', email: 'a@example.com' });
      service.borrowBook(book.id, user.id);

      const reloaded = createService();

      expect(reloaded.getBooks()).to.have.length(1);
      expect(reloaded.getUsers()).to.have.length(1);
      expect(reloaded.getBooks()[0]?.borrowedBy).to.equal(user.id);
    });
  });

  describe('users', () => {
    it('does not allow two users with the same email, ignoring case', () => {
      service.addUser({ name: 'Артем', email: 'artem@example.com' });

      expect(service.isEmailTaken(' ARTEM@example.com ')).to.equal(true);
      expect(() => service.addUser({ name: 'Інший', email: 'Artem@Example.com' })).to.throw(
        'вже існує',
      );
      expect(service.getUsers()).to.have.length(1);
    });

    it('finds a user by id', () => {
      const user = service.addUser({ name: 'Артем', email: 'artem@example.com' });

      expect(service.getUser(user.id)).to.equal(user);
      expect(service.getUser(1)).to.equal(undefined);
    });
  });
});
