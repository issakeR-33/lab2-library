import { expect } from 'chai';
import { Validation } from '../src/utils/validators';

describe('Validation', () => {
  describe('required fields', () => {
    it('reports an error for every empty book field', () => {
      const result = Validation.validateBook({ title: '', author: '  ', year: '' });

      expect(result.valid).to.equal(false);
      expect(result.errors.title).to.equal(Validation.MESSAGES.required);
      expect(result.errors.author).to.equal(Validation.MESSAGES.required);
      expect(result.errors.year).to.equal(Validation.MESSAGES.required);
    });

    it('reports an error for every empty user field', () => {
      const result = Validation.validateUser({ name: '', email: '' });

      expect(result.valid).to.equal(false);
      expect(result.errors.name).to.equal(Validation.MESSAGES.required);
      expect(result.errors.email).to.equal(Validation.MESSAGES.required);
    });

    it('accepts a fully filled book', () => {
      const result = Validation.validateBook({
        title: 'Code Complete',
        author: 'Steve McConnell',
        year: '2004',
      });

      expect(result.valid).to.equal(true);
      expect(result.errors).to.deep.equal({});
    });

    it('accepts a fully filled user', () => {
      const result = Validation.validateUser({ name: 'Артем', email: 'artem@example.com' });

      expect(result.valid).to.equal(true);
    });
  });

  describe('user id', () => {
    it('accepts digits only', () => {
      expect(Validation.validateUserId('1725533394038')).to.equal(null);
    });

    it('rejects an empty value', () => {
      expect(Validation.validateUserId('')).to.equal(Validation.MESSAGES.required);
    });

    it('rejects letters and symbols', () => {
      expect(Validation.validateUserId('12ab')).to.equal(Validation.MESSAGES.digitsOnly);
      expect(Validation.validateUserId('-5')).to.equal(Validation.MESSAGES.digitsOnly);
      expect(Validation.validateUserId('1.5')).to.equal(Validation.MESSAGES.digitsOnly);
    });
  });

  describe('publication year', () => {
    it('accepts a four-digit year in the past', () => {
      expect(Validation.isValidYear('1999')).to.equal(true);
      expect(Validation.isValidYear('2004')).to.equal(true);
    });

    it('rejects a year in the future', () => {
      expect(Validation.isValidYear('2100', 2026)).to.equal(false);
      expect(Validation.isValidYear('2027', 2026)).to.equal(false);
    });

    it('rejects years with a wrong format', () => {
      expect(Validation.isValidYear('99')).to.equal(false);
      expect(Validation.isValidYear('20044')).to.equal(false);
      expect(Validation.isValidYear('1000')).to.equal(false);
      expect(Validation.isValidYear('abcd')).to.equal(false);
    });

    it('reports different messages for non-digits and an invalid year', () => {
      const letters = Validation.validateBook({ title: 'a', author: 'b', year: '20a4' });
      const tooOld = Validation.validateBook({ title: 'a', author: 'b', year: '1200' });

      expect(letters.errors.year).to.equal(Validation.MESSAGES.digitsOnly);
      expect(tooOld.errors.year).to.equal(Validation.MESSAGES.invalidYear);
    });
  });

  describe('email', () => {
    it('rejects an address without a domain', () => {
      const result = Validation.validateUser({ name: 'Артем', email: 'artem@' });

      expect(result.errors.email).to.equal(Validation.MESSAGES.invalidEmail);
    });
  });

  describe('minimum text length', () => {
    it('rejects one-character titles, authors and names', () => {
      const book = Validation.validateBook({ title: 'a', author: 'b', year: '2004' });
      const user = Validation.validateUser({ name: 'a', email: 'a@example.com' });

      expect(book.errors.title).to.equal(Validation.MESSAGES.tooShort(2));
      expect(book.errors.author).to.equal(Validation.MESSAGES.tooShort(2));
      expect(user.errors.name).to.equal(Validation.MESSAGES.tooShort(2));
    });

    it('ignores surrounding spaces when counting characters', () => {
      expect(Validation.isMinLength('  a  ')).to.equal(false);
      expect(Validation.isMinLength(' ab ')).to.equal(true);
    });

    it('reports "required" instead of "too short" for an empty value', () => {
      const result = Validation.validateBook({ title: '', author: 'Author', year: '2004' });

      expect(result.errors.title).to.equal(Validation.MESSAGES.required);
    });
  });
});
