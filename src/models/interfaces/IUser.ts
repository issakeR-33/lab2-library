import type { Identifiable } from '../../types';

export interface IUser extends Identifiable {
  readonly name: string;
  readonly email: string;
  describe(): string;
}
