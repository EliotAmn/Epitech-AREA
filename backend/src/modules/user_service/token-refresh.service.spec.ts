import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';

import { TokenRefreshService } from './token-refresh.service';
import { UserServiceRepository } from './userservice.repository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TokenRefreshService', () => {
  let service: TokenRefreshService;
  let userServiceRepository: jest.Mocked<UserServiceRepository>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRefreshService,
        {
          provide: UserServiceRepository,
          useValue: {
            updateTokens: jest.fn(),
            fromUserIdAndServiceName: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                GOOGLE_CLIENT_ID: 'test-client-id',
                GOOGLE_CLIENT_SECRET: 'test-client-secret',
                GITHUB_CLIENT_ID: 'test-github-client-id',
                GITHUB_CLIENT_SECRET: 'test-github-client-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TokenRefreshService>(TokenRefreshService);
    userServiceRepository = module.get(UserServiceRepository);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isTokenExpired', () => {
    it('should return false when expiresAt is null', () => {
      expect(service.isTokenExpired(null)).toBe(false);
    });

    it('should return true when token has already expired', () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      expect(service.isTokenExpired(pastDate)).toBe(true);
    });

    it('should return true when token expires within 5 minutes', () => {
      const soonDate = new Date(Date.now() + 4 * 60 * 1000); // 4 minutes from now
      expect(service.isTokenExpired(soonDate)).toBe(true);
    });

    it('should return false when token expires in more than 5 minutes', () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      expect(service.isTokenExpired(futureDate)).toBe(false);
    });

    it('should handle exact 5 minute threshold', () => {
      const exactDate = new Date(Date.now() + 5 * 60 * 1000); // exactly 5 minutes
      // Should be considered expired (<=)
      expect(service.isTokenExpired(exactDate)).toBe(true);
    });
  });

  describe('refreshAccessToken', () => {
    const userServiceId = 'test-user-service-id';
    const refreshToken = 'test-refresh-token';

    describe('Google OAuth', () => {
      it('should successfully refresh Google token', async () => {
        const mockTokenResponse = {
          data: {
            access_token: 'new-access-token',
            expires_in: 3600,
            refresh_token: 'new-refresh-token',
          },
        };

        mockedAxios.post.mockResolvedValue(mockTokenResponse);

        const result = await service.refreshAccessToken(
          userServiceId,
          'google',
          refreshToken,
        );

        expect(result).toBe('new-access-token');
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'https://oauth2.googleapis.com/token',
          {
            client_id: 'test-client-id',
            client_secret: 'test-client-secret',
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          },
          expect.objectContaining({
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }),
        );
        expect(userServiceRepository.updateTokens).toHaveBeenCalledWith(
          userServiceId,
          expect.objectContaining({
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            token_expires_at: expect.any(Date),
          }),
        );
      });

      it('should use old refresh token if new one is not provided', async () => {
        const mockTokenResponse = {
          data: {
            access_token: 'new-access-token',
            expires_in: 3600,
            // No refresh_token in response
          },
        };

        mockedAxios.post.mockResolvedValue(mockTokenResponse);

        await service.refreshAccessToken(
          userServiceId,
          'google',
          refreshToken,
        );

        expect(userServiceRepository.updateTokens).toHaveBeenCalledWith(
          userServiceId,
          expect.objectContaining({
            refresh_token: refreshToken, // Should use the old one
          }),
        );
      });

      it('should handle token refresh without expires_in', async () => {
        const mockTokenResponse = {
          data: {
            access_token: 'new-access-token',
            // No expires_in
          },
        };

        mockedAxios.post.mockResolvedValue(mockTokenResponse);

        await service.refreshAccessToken(
          userServiceId,
          'google',
          refreshToken,
        );

        expect(userServiceRepository.updateTokens).toHaveBeenCalledWith(
          userServiceId,
          expect.objectContaining({
            token_expires_at: null,
          }),
        );
      });

      it('should throw error when Google OAuth credentials are not configured', async () => {
        configService.get.mockReturnValue(undefined);

        await expect(
          service.refreshAccessToken(userServiceId, 'google', refreshToken),
        ).rejects.toThrow('Google OAuth credentials not configured');
      });

      it('should throw error on network failure', async () => {
        mockedAxios.post.mockRejectedValue(new Error('Network error'));

        await expect(
          service.refreshAccessToken(userServiceId, 'google', refreshToken),
        ).rejects.toThrow('Network error');
      });

      it('should throw error on invalid_grant', async () => {
        mockedAxios.post.mockRejectedValue({
          response: {
            data: {
              error: 'invalid_grant',
              error_description: 'Token has been revoked',
            },
          },
        });

        await expect(
          service.refreshAccessToken(userServiceId, 'google', refreshToken),
        ).rejects.toMatchObject({
          response: {
            data: {
              error: 'invalid_grant',
            },
          },
        });
      });
    });

    describe('GitHub OAuth', () => {
      it('should successfully refresh GitHub token', async () => {
        const mockTokenResponse = {
          data: {
            access_token: 'new-github-access-token',
            expires_in: 28800,
            refresh_token: 'new-github-refresh-token',
          },
        };

        mockedAxios.post.mockResolvedValue(mockTokenResponse);

        const result = await service.refreshAccessToken(
          userServiceId,
          'github',
          refreshToken,
        );

        expect(result).toBe('new-github-access-token');
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'https://github.com/login/oauth/access_token',
          expect.any(Object),
          expect.objectContaining({
            headers: { Accept: 'application/json' },
          }),
        );
      });
    });

    describe('Unsupported service', () => {
      it('should throw error for unsupported service', async () => {
        await expect(
          service.refreshAccessToken(userServiceId, 'unsupported', refreshToken),
        ).rejects.toThrow('Token refresh not supported for service: unsupported');
      });
    });
  });

  describe('ensureValidToken', () => {
    const userId = 'test-user-id';
    const serviceName = 'google';

    it('should return existing token if not expired', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      const mockUserService = {
        id: 'user-service-id',
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
        token_expires_at: futureDate,
      };

      // Mock the repository to return the user service
      (userServiceRepository.fromUserIdAndServiceName as jest.Mock).mockResolvedValue(mockUserService);

      const result = await service.ensureValidToken(userId, serviceName);

      expect(result).toBe('valid-token');
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should refresh token if expired', async () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 1000);
      const mockUserService = {
        id: 'user-service-id',
        access_token: 'old-token',
        refresh_token: 'refresh-token',
        token_expires_at: pastDate,
      };

      const mockTokenResponse = {
        data: {
          access_token: 'new-access-token',
          expires_in: 3600,
        },
      };

      (userServiceRepository.fromUserIdAndServiceName as jest.Mock).mockResolvedValue(mockUserService);
      mockedAxios.post.mockResolvedValue(mockTokenResponse);

      const result = await service.ensureValidToken(userId, serviceName);

      expect(result).toBe('new-access-token');
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(userServiceRepository.updateTokens).toHaveBeenCalled();
    });

    it('should return null if user service not found', async () => {
      (userServiceRepository.fromUserIdAndServiceName as jest.Mock).mockResolvedValue(null);

      const result = await service.ensureValidToken(userId, serviceName);

      expect(result).toBeNull();
    });

    it('should return null if no OAuth tokens are configured', async () => {
      const mockUserService = {
        id: 'user-service-id',
        access_token: null,
        refresh_token: null,
        token_expires_at: null,
      };

      (userServiceRepository.fromUserIdAndServiceName as jest.Mock).mockResolvedValue(mockUserService);

      const result = await service.ensureValidToken(userId, serviceName);

      expect(result).toBeNull();
    });

    it('should throw error if no refresh token available when token is expired', async () => {
      const mockUserService = {
        id: 'user-service-id',
        access_token: 'old-token',
        refresh_token: null,
        token_expires_at: new Date(Date.now() - 10 * 60 * 1000),
      };

      (userServiceRepository.fromUserIdAndServiceName as jest.Mock).mockResolvedValue(mockUserService);

      await expect(
        service.ensureValidToken(userId, serviceName),
      ).rejects.toThrow('Access token expired but no refresh token available');
    });
  });

  describe('Edge cases', () => {
    it('should handle leap seconds gracefully', () => {
      const leapDate = new Date('2024-06-30T23:59:60Z');
      // Should not throw
      expect(() => service.isTokenExpired(leapDate)).not.toThrow();
    });

    it('should handle very old dates', () => {
      const veryOldDate = new Date('1970-01-01');
      expect(service.isTokenExpired(veryOldDate)).toBe(true);
    });

    it('should handle far future dates', () => {
      const farFutureDate = new Date('2099-12-31');
      expect(service.isTokenExpired(farFutureDate)).toBe(false);
    });
  });
});
