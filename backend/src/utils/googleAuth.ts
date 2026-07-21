import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(googleClientId);

export interface GoogleTokenPayload {
  googleId: string;
  email: string;
  isEmailVerified: boolean;
  fullName: string;
  picture?: string;
}

/**
  Verifies a Google OAuth token (ID token or Access token) using official google-auth-library.
  Extracts and returns user's Gmail address, Google User ID, verification status, and name.
 */
export const verifyGoogleToken = async (token: string): Promise<GoogleTokenPayload> => {
  if (!token) {
    throw new Error('Google OAuth token is required.');
  }

  // First try verifying as an ID token using OAuth2Client
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: googleClientId || undefined,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google ID token payload.');
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      isEmailVerified: payload.email_verified ?? true,
      fullName: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || payload.email,
      picture: payload.picture
    };
  } catch (idTokenError: any) {
    // If ID token verification failed, try access token / userinfo endpoint
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Google UserInfo response error: ${response.statusText}`);
      }

      const userData: any = await response.json();
      if (!userData || !userData.email) {
        throw new Error('Invalid userinfo payload returned by Google.');
      }

      return {
        googleId: userData.sub,
        email: userData.email.toLowerCase(),
        isEmailVerified: userData.email_verified ?? true,
        fullName: userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim() || userData.email,
        picture: userData.picture
      };
    } catch (accessTokenError) {
      throw new Error(`Google token verification failed: ${idTokenError?.message || 'Invalid OAuth token'}`);
    }
  }
};
