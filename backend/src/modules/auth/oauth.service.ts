import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { UserService } from '../user/user.service';
import { OauthLinkRepository } from './oauth-link.repository';

interface OauthProfile {
  id: string | number;
  email?: string;
  displayName?: string;
  [key: string]: any;
}

@Injectable()
export class OauthService {
  private readonly GRANT_TTL_MS = 60_000;
  private readonly grants = new Map<
    string,
    { token: string; expiresAt: number; timeout: NodeJS.Timeout }
  >();

  constructor(
    private readonly oauthLinkRepo: OauthLinkRepository,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private isOauthProfile(obj: unknown): obj is OauthProfile {
    return typeof obj === 'object' && obj !== null && 'id' in obj;
  }

  private async findOrCreateUserFromProfile(
    provider: string,
    profile: OauthProfile,
  ): Promise<User> {
    const providerUserId = String(profile.id);
    const email: string | undefined = profile.email;
    const displayName: string =
      profile.displayName ||
      (email
        ? email.split('@')[0]
        : `${provider}_${providerUserId.slice(0, 6)}`);

    const link = await this.oauthLinkRepo.findByProviderAndId(
      provider,
      providerUserId,
    );
    if (link?.user) return link.user;

    if (email) {
      const existing = await this.usersService.findByEmail(email);
      if (existing) {
        await this.oauthLinkRepo.create({
          provider_name: provider,
          provider_user_id: providerUserId,
          user_id: existing.id,
        });
        return existing;
      }
    }

    const created = await this.usersService.create({
      email: email || `${provider}_${providerUserId}@no-email.local`,
      name: displayName,
      auth_platform: provider as 'local' | 'google' | 'github' | undefined,
    });

    await this.oauthLinkRepo.create({
      provider_name: provider,
      provider_user_id: providerUserId,
      user_id: created.id,
    });

    return created;
  }

  async handleProviderCallback(provider: string, profile: unknown) {
    if (!this.isOauthProfile(profile)) {
      throw new Error('Invalid OAuth profile received from provider');
    }
    const user = await this.findOrCreateUserFromProfile(provider, profile);
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    const safeUser: Partial<User & Record<string, any>> = { ...user };
    delete safeUser.password_hash;
    return { user: safeUser, access_token: token };
  }

  createGrant(accessToken: string): string {
    const code = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + this.GRANT_TTL_MS;
    const timeout = setTimeout(() => {
      this.grants.delete(code);
    }, this.GRANT_TTL_MS);
    this.grants.set(code, { token: accessToken, expiresAt, timeout });
    return code;
  }

  consumeGrant(code: string): string | null {
    if (!code) return null;
    const entry = this.grants.get(code);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      clearTimeout(entry.timeout);
      this.grants.delete(code);
      return null;
    }
    clearTimeout(entry.timeout);
    this.grants.delete(code);
    return entry.token;
  }
}
