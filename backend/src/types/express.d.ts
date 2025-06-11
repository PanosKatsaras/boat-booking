import { Role } from '@prisma/client'; // The Role enum from Prisma client

/**
 * Declaration merging for Express Request object.
 * This extends the Request interface provided by '@types/express'
 * to include a 'user' property.
 *
 * This 'user' property will hold the decoded JWT payload
 * after successful authentication by the authenticateJWT middleware.
 *
 * The '?' makes the 'user' property optional, as not all requests
 * will have an authenticated user (e.g., public routes).
 */
declare global {
  namespace Express {
    interface Request {
      // Defines the structure of the JWT payload that will be attached to req.user.
      // - id: The unique ID of the user (from the database).
      // - email: The user's email address.
      // - role: The user's role, crucial for role-based authorization.
      // - iat: "Issued At" timestamp (standard JWT claim).
      // - exp: "Expiration Time" timestamp (standard JWT claim).
      user?: { id: string; email: string; role: Role; iat: number; exp: number; };
    }
  }
}
