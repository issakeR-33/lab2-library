import { expect } from 'chai';
import { generateId } from '../src/utils/idGenerator';

describe('generateId', () => {
  it('returns unique, growing ids even when called many times in one millisecond', () => {
    const ids = Array.from({ length: 1000 }, () => generateId());

    expect(new Set(ids).size).to.equal(ids.length);
    expect([...ids].sort((a, b) => a - b)).to.deep.equal(ids);
  });
});
