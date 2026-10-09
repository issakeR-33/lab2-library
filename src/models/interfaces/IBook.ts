import type { Id, Identifiable } from '../../types';

export interface IBook extends Identifiable {
  readonly title: string;
  readonly author: string;
  readonly year: number;
  readonly borrowedBy: Id | null;
  readonly isBorrowed: boolean;
  describe(): string;
}
