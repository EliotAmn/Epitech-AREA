import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UserServiceRepository } from '../user_service/userservice.repository';
import { UserService } from '../user/user.service';
import { OauthLinkRepository } from './oauth-link.repository';

interface OauthProfile {
  id: string | number;
  email?: string;
  displayName?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  [key: string]: any;
}

@Injectable()
export class OauthService {
  private readonly logger = new Logger(OauthService.name);
  private readonly GRANT_TTL_MS = 60_000;
  private readonly grants = new Map<
    string,
    { token: string; expiresAt: number; timeout: NodeJS.Timeout }
  >();

  constructor(
    private readonly oauthLinkRepo: OauthLinkRepository,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly userServiceRepository: UserServiceRepository,
    private readonly prisma: PrismaService,
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

    // Store OAuth tokens in UserService table if they exist
    if (profile.accessToken) {
      try {
        await this.storeOAuthTokens(
          user.id,
          provider,
          profile.accessToken,
          profile.refreshToken,
          profile.expiresIn,
        );
      } catch (error) {
        this.logger.error(
          `Failed to store OAuth tokens for user ${user.id} and provider ${provider}. Authentication will fail.`,
          error,
        );
        throw new Error(
          `OAuth token storage failed for provider ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      admin: user.admin,
    });

    const safeUser: Partial<User & Record<string, any>> = { ...user };
    delete safeUser.password_hash;

    try {
      const maybeAccess = profile.accessToken;
      const maybeRefresh = profile.refreshToken;
      const profileData = profile as Record<string, unknown>;
      const expiresIn = (profileData.expires_in || profileData.expiresIn) as
        | number
        | undefined;

      if (provider === 'google' && (maybeAccess || maybeRefresh)) {
        const existing = await this.prisma.userService.findFirst({
          where: { user_id: user.id, service_name: 'gmail' },
        });

        const now = Date.now();
        // Calculate absolute expiration time if expiresIn is provided
        const expiryDate = expiresIn
          ? now + Number(expiresIn) * 1000
          : undefined;

        const newConfig = {
          ...((existing?.service_config as Record<string, any> | undefined) ||
            {}),
          ...(maybeAccess ? { google_access_token: maybeAccess } : {}),
          ...(maybeRefresh ? { google_refresh_token: maybeRefresh } : {}),
          ...(expiryDate ? { google_token_expires_at: expiryDate } : {}),
        };

        if (existing) {
          await this.prisma.userService.update({
            where: { id: existing.id },
            data: { service_config: newConfig as Prisma.JsonObject },
          });
        } else {
          await this.prisma.userService.create({
            data: {
              user_id: user.id,
              service_name: 'gmail',
              service_config: newConfig as Prisma.JsonObject,
            },
          });
        }
      }
    } catch (e) {
      console.error('Failed to persist google tokens to user_service:', e);
    }

    return { user: safeUser, access_token: token };
  }

  private async storeOAuthTokens(
    userId: string,
    serviceName: string,
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number,
  ) {
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : null;

    // Check if user service already exists
    const existingService =
      await this.userServiceRepository.fromUserIdAndServiceName(
        userId,
        serviceName,
      );

    if (existingService) {
      // Update existing service with new tokens
      await this.userServiceRepository.updateTokens(existingService.id, {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
      });
      this.logger.debug(
        `Updated OAuth tokens for user ${userId} service ${serviceName}`,
      );
    } else {
      // Create new user service with tokens
      await this.userServiceRepository.create({
        user_id: userId,
        service_name: serviceName,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        service_config: {},
      });
      this.logger.debug(
        `Created UserService with OAuth tokens for user ${userId} service ${serviceName}`,
      );
    }
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
