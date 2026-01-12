# OAuth2 Token Refresh Implementation

This document describes the OAuth2 token refresh functionality implemented to ensure continuous operation of the AREA platform without requiring users to log in every hour.

## Overview

The system automatically refreshes OAuth2 access tokens before they expire, ensuring that user-configured automations (Areas) continue running without interruption.

## Features Implemented

### 1. Database Schema Updates

Added three new fields to the `UserService` model:
- `access_token` (String?): Stores the OAuth2 access token
- `refresh_token` (String?): Stores the refresh token for obtaining new access tokens
- `token_expires_at` (DateTime?): Stores the expiration timestamp of the access token

### 2. Token Refresh Service

**Location**: `backend/src/modules/user_service/token-refresh.service.ts`

Key methods:
- `isTokenExpired(expiresAt)`: Checks if a token is expired or will expire within 5 minutes
- `refreshAccessToken(userServiceId, serviceName, refreshToken)`: Refreshes an expired token using the refresh token
- `ensureValidToken(userId, serviceName)`: Ensures a valid access token is available, refreshing it if necessary

Supported OAuth providers:
- Google OAuth2
- GitHub OAuth2 (ready for future implementation)

### 3. OAuth Strategy Updates

**Location**: `backend/src/modules/auth/strategies/google.strategy.ts`

Modified the Google OAuth strategy to:
- Capture `accessToken` and `refreshToken` from the OAuth callback
- Pass these tokens to the OAuth service for storage

### 4. Token Storage in Authentication Flow

**Location**: `backend/src/modules/auth/oauth.service.ts`

The OAuth service now:
- Stores access tokens and refresh tokens when a user authenticates via OAuth
- Creates or updates `UserService` records with token information
- Calculates and stores token expiration timestamps

### 5. Automatic Token Refresh in Area Execution

**Location**: `backend/src/modules/area/area.service.ts`

#### For Reactions (Actions triggered by events):
Before executing any reaction that requires OAuth authentication:
1. Check if the access token is expired using `tokenRefreshService.ensureValidToken()`
2. If expired, automatically refresh the token using the stored refresh token
3. Update the database with the new token
4. Inject the fresh access token into the service configuration
5. Execute the reaction with the valid token

#### For Actions (Event triggers):
Before polling actions and during initialization:
1. Ensure valid access token before each poll cycle
2. Automatically refresh if needed
3. Update service configuration with the fresh token

### 6. Authentication Error Handling

When token refresh fails due to:
- User revoking access (`invalid_grant` error)
- Refresh token being revoked
- Other authentication errors

The system:
1. Marks the `UserService` as errored (`errored = true`)
2. Stops all polling for Areas using that service
3. Disables affected Areas to prevent repeated failures
4. Logs warnings for monitoring and debugging

This prevents the system from repeatedly attempting operations with invalid credentials.

## How It Works

### Initial OAuth Flow

```
1. User clicks "Login with Google"
2. User authorizes the application
3. Google redirects back with authorization code
4. Backend exchanges code for access_token and refresh_token
5. Backend stores both tokens in UserService table
6. Backend calculates and stores expiration time
```

### Automatic Token Refresh

```
1. Area execution begins (Action poll or Reaction trigger)
2. System checks if access_token is expired (or will expire in < 5 min)
3. If expired:
   a. System uses refresh_token to request new access_token from provider
   b. Provider returns new access_token (and possibly new refresh_token)
   c. System updates database with new tokens
   d. System uses new access_token for API call
4. If not expired:
   a. System uses existing access_token
```

### Error Handling Flow

```
1. Token refresh fails with "invalid_grant" or "revoked" error
2. System marks UserService as errored
3. System identifies all Areas using that service
4. System stops polling for those Areas
5. System logs warning for admin notification
6. User must re-authenticate to resume service
```

## Configuration

### Environment Variables Required

For Google OAuth:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

For GitHub OAuth (future):
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Token Expiry Buffer

Tokens are considered expired 5 minutes before their actual expiration time to prevent race conditions where a token expires during an API call.

## Database Migration

To apply the schema changes:

```bash
cd backend
npm run prisma:migrate
```

Or for development:
```bash
npx prisma migrate dev --schema=src/prisma/schema.prisma
```

## Testing

### Manual Testing

1. **Test OAuth Flow**:
   - Log in with Google
   - Verify tokens are stored in database
   - Check `user_service` table for `access_token`, `refresh_token`, and `token_expires_at`

2. **Test Token Refresh**:
   - Set `token_expires_at` to a past date in database
   - Trigger an Area that uses Google service
   - Verify new token is fetched and stored
   - Check logs for "Successfully refreshed access token" message

3. **Test Error Handling**:
   - Revoke app access in Google account settings
   - Trigger an Area using Google service
   - Verify Area is disabled and UserService is marked as errored
   - Check logs for "Disabled areas for user" message

## Security Considerations

1. **Token Storage**: Access tokens and refresh tokens are stored in the database. Ensure database access is properly secured.

2. **Token Transmission**: Tokens are never exposed in API responses or logs (except in debug mode).

3. **Token Refresh Window**: 5-minute buffer prevents token expiration during operations.

4. **Automatic Cleanup**: When refresh fails due to revocation, the system automatically disables affected features.

## Future Enhancements

1. **Support for More OAuth Providers**:
   - GitHub
   - Microsoft
   - Discord (for user OAuth, not bot tokens)

2. **Token Encryption**: Consider encrypting tokens at rest in the database

3. **User Notifications**: Notify users when their OAuth access needs re-authorization

4. **Grace Period**: Allow limited retries before permanently disabling an Area

5. **Dashboard**: Show token status and expiration times in user dashboard

## Troubleshooting

### Issue: "Access token expired but no refresh token available"

**Cause**: User authenticated before this feature was implemented, or OAuth provider doesn't support refresh tokens.

**Solution**: User needs to re-authenticate via OAuth flow to obtain a refresh token.

### Issue: "Token refresh failed" with no specific error

**Cause**: Network issues or OAuth provider is temporarily unavailable.

**Solution**: System will retry on next execution. If persistent, check OAuth provider status.

### Issue: Areas disabled after token error

**Cause**: User revoked access or refresh token is invalid.

**Solution**: User must re-authenticate with the OAuth provider to restore access.

## Implementation Checklist

- [x] Add OAuth token fields to Prisma schema
- [x] Create token refresh service
- [x] Update Google OAuth strategy to capture tokens
- [x] Store tokens during OAuth callback
- [x] Integrate token refresh in reaction execution
- [x] Integrate token refresh in action polling
- [x] Handle authentication errors gracefully
- [x] Disable Areas on persistent auth failures
- [x] Add logging for debugging and monitoring
- [x] Create database migration
- [x] Test compilation and build

## Related Files

- `backend/src/prisma/schema.prisma`: Database schema with OAuth token fields
- `backend/src/modules/user_service/token-refresh.service.ts`: Core token refresh logic
- `backend/src/modules/user_service/userservice.repository.ts`: Database operations for tokens
- `backend/src/modules/auth/strategies/google.strategy.ts`: Google OAuth strategy with token capture
- `backend/src/modules/auth/oauth.service.ts`: OAuth service with token storage
- `backend/src/modules/area/area.service.ts`: Area execution with automatic token refresh
