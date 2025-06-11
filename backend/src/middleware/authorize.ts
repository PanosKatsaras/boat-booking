import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client'; // The Role enum from Prisma client

/**
 * Middleware for role-based authorization.
 * This middleware checks if the authenticated user (from `req.user` populated by `authenticateJWT`)
 * has one of the specified required roles.
 *
 * Always be used AFTER the `authenticateJWT` middleware.
 *
 */
export const authorizeRole = (requiredRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure `req.user` is populated. If not, it means `authenticateJWT` didn't run
    // or failed, or the route is not protected by `authenticateJWT`.
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
    }

    // Check if the user's role (from the JWT payload) is included in the `requiredRoles` array.
    if (!requiredRoles.includes(req.user.role)) {
      // If the user's role does not match any of the required roles, deny access.
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    }

    // If the user is authenticated and has an allowed role, proceed to the next middleware or route handler.
    next();
  };
};

