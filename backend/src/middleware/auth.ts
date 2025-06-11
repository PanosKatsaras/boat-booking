import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { clearJwtCookie } from '../utils/jwt'; // Utility to clear cookie

/**
 * Middleware for JWT authentication.
 * This middleware extracts the JWT from the 'jwt' httpOnly cookie,
 * verifies it, and attaches the decoded user payload to the request object (`req.user`).
 *
 * If authentication fails (no token, invalid token, expired token),
 * it clears the cookie and sends an error response.
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // Access the JWT from the 'jwt' cookie.
  // `req.cookies` is populated by the `cookie-parser` middleware.
  const token = req.cookies.jwt;

  // If no token is found in the cookie, the user is not authenticated.
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' }); // 401 Unauthorized
  }

  // Check the secret key from environment variables.
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server configuration error.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err: any, user: any) => {
    // If an error occurs during verification (e.g., token expired, signature invalid)
    if (err) {
      // Clear the invalid or expired cookie from the client.
      clearJwtCookie(res);

      // Handle specific JWT errors for more informative responses.
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired. Please log in again.' }); // 401 Unauthorized
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(403).json({ message: 'Invalid token. Please log in again.' }); // 403 Forbidden
      }
      // For any other verification error.
      return res.status(403).json({ message: 'Authentication failed.' }); // 403 Forbidden
    }

    // If verification is successful, attach the decoded user payload to the request object.
    // The type assertion `as Request['user']`.
    req.user = user as Request['user'];
    // Pass control to the next middleware or route handler.
    next();
  });
};
