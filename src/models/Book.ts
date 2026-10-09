import type { BookData, Id, Identifiable } from '../types';

export interface IBook extends Identifiable {
  readonly title: string;
  readonly author: string;
  readonly year: number;
  readonly borrowedBy: Id | null;
  readonly isBorrowed: boolean;
  describe(): string;
}

export class Book implements IBook {
  private readonly _id: Id;
  private readonly _title: string;
  private readonly _author: string;
  private readonly _year: number;
  private _borrowedBy: Id | null;

  constructor(id: Id, title: string, author: string, year: number, borrowedBy: Id | null = null) {
    this._id = id;
    this._title = title;
    this._author = author;
    this._year = year;
    this._borrowedBy = borrowedBy;
  }

  get id(): Id {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get author(): string {
    return this._author;
  }

  get year(): number {
    return this._year;
  }

  get borrowedBy(): Id | null {
    return this._borrowedBy;
  }

  get isBorrowed(): boolean {
    return this._borrowedBy !== null;
  }

  borrow(userId: Id): void {
    if (this.isBorrowed) {
      throw new Error(`Книга "${this._title}" вже позичена`);
    }
    this._borrowedBy = userId;
  }

  giveBack(): void {
    this._borrowedBy = null;
  }

  describe(): string {
    return `${this._title} by ${this._author} (${this._year})`;
  }

  toJSON(): BookData {
    return {
      id: this._id,
      title: this._title,
      author: this._author,
      year: this._year,
      borrowedBy: this._borrowedBy,
    };
  }

  static fromJSON(data: BookData): Book {
    return new Book(data.id, data.title, data.author, data.year, data.borrowedBy);
  }
}
