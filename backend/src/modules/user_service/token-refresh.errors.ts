/**
 * Custom error types for OAuth token refresh operations
 */

export enum OAuthErrorCode {
  /** Token has been revoked by the user */
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  /** Refresh token is invalid or expired */
  INVALID_GRANT = 'INVALID_GRANT',
  /** OAuth credentials not configured */
  CREDENTIALS_NOT_CONFIGURED = 'CREDENTIALS_NOT_CONFIGURED',
  /** Service doesn't support token refresh */
  REFRESH_NOT_SUPPORTED = 'REFRESH_NOT_SUPPORTED',
  /** Generic refresh failure */
  REFRESH_FAILED = 'REFRESH_FAILED',
}

export class OAuthError extends Error {
  constructor(
    public readonly code: OAuthErrorCode,
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'OAuthError';
    Object.setPrototypeOf(this, OAuthError.prototype);
  }

  /**
   * Check if this is an auth error that requires user re-authentication
   */
  isAuthError(): boolean {
    return (
      this.code === OAuthErrorCode.TOKEN_REVOKED ||
      this.code === OAuthErrorCode.INVALID_GRANT
    );
  }
}

/**
 * Parse axios error response to determine OAuth error code
 */
export function parseOAuthError(error: any): OAuthErrorCode {
  // Check for axios error with response
  if (error.response?.data) {
    const data = error.response.data;
    const errorField = data.error || data.error_description || '';

    // Check for specific OAuth error codes
    if (
      errorField.includes('invalid_grant') ||
      error.response.status === 400
    ) {
      return OAuthErrorCode.INVALID_GRANT;
    }

    if (errorField.includes('token_revoked') || errorField.includes('revoked')) {
      return OAuthErrorCode.TOKEN_REVOKED;
    }
  }

  // Check HTTP status codes
  if (error.response?.status === 401 || error.response?.status === 403) {
    return OAuthErrorCode.TOKEN_REVOKED;
  }

  return OAuthErrorCode.REFRESH_FAILED;
}
