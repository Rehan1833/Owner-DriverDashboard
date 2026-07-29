<<<<<<< HEAD
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(googleClientId);
=======
/*
 * TEMPORARILY DISABLED: Google OAuth Authentication Module
 * To re-enable:
 * 1. Uncomment import { OAuth2Client } from 'google-auth-library';
 * 2. Restore client initialization and token verification logic below.
 */

// import { OAuth2Client } from 'google-auth-library';

// const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
// const client = new OAuth2Client(googleClientId);
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a

export interface GoogleTokenPayload {
  googleId: string;
  email: string;
  isEmailVerified: boolean;
  fullName: string;
  picture?: string;
}

/**
<<<<<<< HEAD
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
=======
 * TEMPORARILY DISABLED: Verifies a Google OAuth token using official google-auth-library.
 */
export const verifyGoogleToken = async (_token: string): Promise<GoogleTokenPayload> => {
  /*
  // TEMPORARILY DISABLED GOOGLE OAUTH IMPLEMENTATION
  if (!_token) {
    throw new Error('Google OAuth token is required.');
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const ticket = await client.verifyIdToken({
      idToken: _token,
      audience: clientId || undefined,
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google ID token payload.');
    }

<<<<<<< HEAD
    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      isEmailVerified: payload.email_verified ?? true,
=======
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (payload.iss && !validIssuers.includes(payload.iss)) {
      throw new Error(`Invalid token issuer: ${payload.iss}`);
    }

    if (payload.email_verified === false) {
      throw new Error('Unverified Google email address. Please verify your Google account before signing in.');
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase().trim(),
      isEmailVerified: true,
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
      fullName: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || payload.email,
      picture: payload.picture
    };
  } catch (idTokenError: any) {
<<<<<<< HEAD
    // If ID token verification failed, try access token / userinfo endpoint
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
=======
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${_token}` }
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
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
<<<<<<< HEAD
        email: userData.email.toLowerCase(),
        isEmailVerified: userData.email_verified ?? true,
        fullName: userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim() || userData.email,
        picture: userData.picture
      };
    } catch (accessTokenError) {
      throw new Error(`Google token verification failed: ${idTokenError?.message || 'Invalid OAuth token'}`);
    }
  }
=======
        email: userData.email.toLowerCase().trim(),
        isEmailVerified: true,
        fullName: userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim() || userData.email,
        picture: userData.picture
      };
    } catch (accessTokenError: any) {
      throw new Error(`Google token verification failed: ${idTokenError?.message || accessTokenError?.message || 'Invalid OAuth token'}`);
    }
  }
  */
  throw new Error('Google authentication is temporarily disabled.');
>>>>>>> 98a6f2e269eab87d20df8838bf300a778640a36a
};
