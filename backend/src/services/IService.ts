import type { Action, Reaction, TokenValidationResult } from './types';

/**
 * Contract for external services used by the Glue engine.
 * Implementations must provide metadata and the actions/reactions they support.
 */
export interface IService<A = Action, R = Reaction, T = TokenValidationResult> {
  /** Human friendly identifier */
  name: string;

  /** UI color (hex or css value) */
  color?: string;

  /** Icon identifier / URL */
  icon?: string;

  /**
   * Actions available from this service (things that can be observed).
   * Example: "new-issue-created" for GitHub.
   */
  getActions(): Promise<A[]> | A[];

  /**
   * Reactions available on this service (things that can be executed).
   * Example: "create-issue" for GitHub.
   */
  getReactions(): Promise<R[]> | R[];

  /**
   * Validate the provided token/credentials for this service.
   * Return a small result indicating validity and optional reason.
   */
  validateToken(token: string): Promise<T> | T;
}

export default IService;
