import type { Id, Identifiable, UserData } from '../types';

export interface IUser extends Identifiable {
  readonly name: string;
  readonly email: string;
  describe(): string;
}

export class User implements IUser {
  private readonly _id: Id;
  private readonly _name: string;
  private readonly _email: string;

  constructor(id: Id, name: string, email: string) {
    this._id = id;
    this._name = name;
    this._email = email;
  }

  get id(): Id {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  describe(): string {
    return `${this._id} ${this._name} (${this._email})`;
  }

  toJSON(): UserData {
    return { id: this._id, name: this._name, email: this._email };
  }

  static fromJSON(data: UserData): User {
    return new User(data.id, data.name, data.email);
  }
}
