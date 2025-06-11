import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { Role } from '@prisma/client';

// The shape of the user data that will be included in the JWT payload
interface JwtUserPayload {
  id: string;
  email: string | null;
  role: Role;
}

/**
 * Generates a JSON Web Token (JWT) for a given user.
 * This function takes user information (like their ID, email, and role)
 * and creates a secure, encoded string called a JSON Web Token (JWT).
 *
 * The user object containing their unique 'id', 'email', and 'role'.
 * @returns A signed JWT string. This is the compact, encrypted string that
 * frontend will receive and send back with subsequent requests to prove
 * the user's identity.
 *
 */
export const generateAccessToken = (user: JwtUserPayload): string => {
  // First, check if the secret key for signing JWTs is set up in our environment variables.
  // This secret is crucial for security.
  if (!process.env.JWT_SECRET) {
    // If the secret is missing, it's a critical configuration error, so we stop and throw error.
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  // jwt.sign() creates the token.
  // It takes three main arguments:
  // 1. { id: user.id, email: user.email, role: user.role }: This is the 'payload' of our JWT.
  // 2. process.env.JWT_SECRET: This is the secret key, used to digitally sign the token.
  // 3. { expiresIn: '1h' }: This is an options object. 
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token expiration time (1 hour)
  );
};

// Sets an httpOnly JWT cookie in the response.
// res - The Express response object.
// token - The JWT string to be set as a cookie.
export const setHttpOnlyJwtCookie = (res: Response, token: string) => {
  res.cookie('jwt', token, {
    httpOnly: true, // Make the cookie inaccessible to client-side JavaScript
    secure: process.env.NODE_ENV === 'production', // Send cookie only over HTTPS in production
    sameSite: 'lax',
    maxAge: 3600000, // Cookie expiration in milliseconds (1 hour to match token expiry)
    path: '/', // The cookie is accessible from all paths on the domain
  });
};

// Clears the httpOnly JWT cookie from the response.
// res - The Express response object.
export const clearJwtCookie = (res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
  });
};
