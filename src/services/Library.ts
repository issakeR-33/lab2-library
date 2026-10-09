import type { Id, Identifiable } from '../types';

export class Library<T extends Identifiable> {
  private items: T[] = [];

  constructor(items: readonly T[] = []) {
    items.forEach((item) => this.add(item));
  }

  get size(): number {
    return this.items.length;
  }

  add(item: T): void {
    if (this.getById(item.id)) {
      throw new Error(`Елемент з id ${item.id} вже існує`);
    }
    this.items.push(item);
  }

  remove(id: Id): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }

  getById(id: Id): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  search(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  getAll(): T[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
  }
}
