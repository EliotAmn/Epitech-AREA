import { Inject, Injectable } from '@nestjs/common';

import type IService from './IService';
import type { Action, Reaction, TokenValidationResult } from './types';

/**
 * ServicesRegistry holds all registered IService implementations and
 * exposes a small generic API to the rest of the application.
 */
@Injectable()
export class ServicesRegistry {
  constructor(@Inject('SERVICES') private services: IService[]) {}

  listServices() {
    return this.services.map((s) => ({
      name: s.name,
      color: s.color,
      icon: s.icon,
    }));
  }

  findService(name: string): IService | undefined {
    return this.services.find((s) => s.name === name);
  }

  async getActions(name: string): Promise<Action[]> {
    const svc = this.findService(name);
    if (!svc) return [];
    return Promise.resolve(svc.getActions());
  }

  async getReactions(name: string): Promise<Reaction[]> {
    const svc = this.findService(name);
    if (!svc) return [];
    return Promise.resolve(svc.getReactions());
  }

  async validateToken(
    name: string,
    token: string,
  ): Promise<TokenValidationResult> {
    const svc = this.findService(name);
    if (!svc) return { valid: false, reason: 'service-not-found' };
    return Promise.resolve(svc.validateToken(token));
  }

  /**
   * Run a reaction by id. This uses a convention to map reaction ids to method
   * names on the service implementation. For example `send_message` -> `sendMessage`.
   * The payload is forwarded to the method as a single argument (or spread if array).
   */
  async runReaction(
    name: string,
    reactionId: string,
    payload?: any,
  ): Promise<any> {
    const svc = this.findService(name);
    if (!svc) throw new Error(`service not found: ${name}`);

    const method = ServicesRegistry.reactionIdToMethod(reactionId);
    const fn = (svc as any)[method];
    if (typeof fn !== 'function') {
      throw new Error(`reaction method not implemented: ${method} on ${name}`);
    }

    if (Array.isArray(payload)) return fn.apply(svc, payload);
    return fn.call(svc, payload);
  }

  private static reactionIdToMethod(id: string) {
    return id
      .split(/[-_]/)
      .map((part, i) =>
        i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
      )
      .join('');
  }
}

export default ServicesRegistry;
