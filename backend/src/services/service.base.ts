import type IService from '../common/service.types';
import type { Action, Reaction, TokenValidationResult } from './types';

/**
 * Small abstract class providing defaults and helpers for IService implementations.
 * Implementors should extend this class and override the abstract methods.
 */
export abstract class ServiceBase<
  A = Action,
  R = Reaction,
  T = TokenValidationResult,
> implements IService<A, R, T>
{
  abstract name: string;
  color?: string;
  icon?: string;

  constructor(opts?: { color?: string; icon?: string }) {
    if (opts) {
      this.color = opts.color;
      this.icon = opts.icon;
    }
  }

  abstract getActions(): Promise<A[]> | A[];
  abstract getReactions(): Promise<R[]> | R[];
  abstract validateToken(token: string): Promise<T> | T;

  // helper: map an array of simple names to Action shapes
  protected toActions(names: string[]): A[] {
    return names.map((n) => ({ id: n, name: n }) as A);
  }

  protected toReactions(names: string[]): R[] {
    return names.map((n) => ({ id: n, name: n }) as R);
  }
}

export default ServiceBase;
