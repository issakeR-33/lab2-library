import { expect } from 'chai';
import { PAGE_SIZE, paginate } from '../src/utils/pagination';

describe('paginate', () => {
  const items = Array.from({ length: 12 }, (_, i) => i + 1);

  it(`splits items into pages of ${PAGE_SIZE}`, () => {
    expect(paginate(items, 1)).to.deep.equal({ items: [1, 2, 3, 4, 5], page: 1, totalPages: 3 });
    expect(paginate(items, 3)).to.deep.equal({ items: [11, 12], page: 3, totalPages: 3 });
  });

  it('keeps the page number inside the valid range', () => {
    expect(paginate(items, 99).page).to.equal(3);
    expect(paginate(items, 0).page).to.equal(1);
  });

  it('always has one page, even for an empty list', () => {
    expect(paginate([], 1)).to.deep.equal({ items: [], page: 1, totalPages: 1 });
  });

  it('supports a custom page size', () => {
    expect(paginate(items, 2, 10).items).to.deep.equal([11, 12]);
  });
});
