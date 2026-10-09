import { expect } from 'chai';
import { Library } from '../src/services/Library';
import { Book } from '../src/models/Book';

describe('Library', () => {
  let library: Library<Book>;
  let cleanCode: Book;
  let codeComplete: Book;

  beforeEach(() => {
    library = new Library<Book>();
    cleanCode = new Book(1, 'Clean Code', 'Robert Martin', 2008);
    codeComplete = new Book(2, 'Code Complete', 'Steve McConnell', 2004);
  });

  describe('add', () => {
    it('adds an item to the collection', () => {
      library.add(cleanCode);

      expect(library.size).to.equal(1);
      expect(library.getById(1)).to.equal(cleanCode);
    });

    it('throws when an item with the same id already exists', () => {
      library.add(cleanCode);

      expect(() => library.add(new Book(1, 'Other', 'Someone', 2000))).to.throw('вже існує');
    });
  });

  describe('remove', () => {
    it('removes an existing item and returns true', () => {
      library.add(cleanCode);

      expect(library.remove(1)).to.equal(true);
      expect(library.size).to.equal(0);
    });

    it('returns false when the item does not exist', () => {
      expect(library.remove(42)).to.equal(false);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      library.add(cleanCode);
      library.add(codeComplete);
    });

    it('finds items matching the predicate', () => {
      const result = library.search((book) => book.author.includes('Martin'));

      expect(result).to.deep.equal([cleanCode]);
    });

    it('returns an empty array when nothing matches', () => {
      expect(library.search((book) => book.year > 3000)).to.deep.equal([]);
    });

    it('returns all matching items', () => {
      expect(library.search((book) => book.title.includes('Code'))).to.have.length(2);
    });
  });

  describe('getAll', () => {
    it('returns a copy, so the internal collection cannot be changed from outside', () => {
      library.add(cleanCode);

      library.getAll().pop();

      expect(library.size).to.equal(1);
    });
  });
});
