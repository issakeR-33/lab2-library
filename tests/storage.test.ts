import { expect } from 'chai';
import { Storage } from '../src/services/Storage';
import { MemoryBackend } from './helpers';

describe('Storage', () => {
  let backend: MemoryBackend;
  let storage: Storage;

  beforeEach(() => {
    backend = new MemoryBackend();
    storage = new Storage(backend);
  });

  it('saves and loads a value', () => {
    storage.save('numbers', [1, 2, 3]);

    expect(storage.load<number[]>('numbers', [])).to.deep.equal([1, 2, 3]);
  });

  it('returns the fallback when the key is missing', () => {
    expect(storage.load('missing', 'default')).to.equal('default');
  });

  it('returns the fallback when stored data is not valid JSON', () => {
    backend.setItem('library-app:broken', '{not json');

    expect(storage.load('broken', 'default')).to.equal('default');
  });

  it('removes a single key', () => {
    storage.save('a', 1);
    storage.save('b', 2);

    storage.remove('a');

    expect(storage.load('a', null)).to.equal(null);
    expect(storage.load('b', null)).to.equal(2);
  });

  it('clears only keys with its own prefix', () => {
    storage.save('a', 1);
    backend.setItem('foreign', 'keep me');

    storage.clear();

    expect(storage.load('a', null)).to.equal(null);
    expect(backend.getItem('foreign')).to.equal('keep me');
  });
});
