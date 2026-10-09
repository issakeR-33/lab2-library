export type Id = number;

export interface Identifiable {
  readonly id: Id;
}

export interface BookData {
  id: Id;
  title: string;
  author: string;
  year: number;
  borrowedBy: Id | null;
}

export interface UserData {
  id: Id;
  name: string;
  email: string;
}
