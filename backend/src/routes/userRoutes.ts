import { Router } from 'express';
import prisma from '../config/prisma'; // Prisma client
import { authenticateJWT } from '../middleware/auth'; // JWT authentication middleware

const router = Router();

// Private (Authenticated User)
// This route is protected and requires a valid JWT.
// Get the profile of the currently authenticated user.
router.get('/profile', authenticateJWT, async (req, res) => {
  // `req.user` is populated by the `authenticateJWT` middleware
  // It contains the decoded JWT payload (id, email, role).
  if (!req.user) {
    // This check is a safeguard; authenticateJWT should already handle this.
    return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
  }

  try {
    // Fetch the full user details from the database using the ID from the JWT payload.
    // Select specific fields to avoid sending sensitive data like hashed password.
    const userFromDb = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Fail message if user not found
    if (!userFromDb) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Respond with the user's profile data
    res.json(userFromDb);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Private (Authenticated User)
// This route is protected and requires a valid JWT.
// Get all bookings for the currently authenticated user.
router.get('/bookings/my', authenticateJWT, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
  }

  try {
    // Fetch bookings associated with the authenticated user's ID.
    // Include related 'boat' and 'port' data for a richer response.
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        boat: { select: { id: true, name: true, type: true } }, // Select specific boat fields
        port: { select: { id: true, name: true } }, // Select specific port fields
      },
      orderBy: {
        createdAt: 'desc', // Order by most recent bookings first
      },
    });

    // Map the bookings to replace null relations with a placeholder.
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      boat: booking.boat || { id: null, name: 'Deleted Boat', type: 'UNKNOWN' }, // Default if boat is null
      port: booking.port || { id: null, name: 'Deleted Port' }, // Default if port is null
    }));

    // Respond with the list of bookings
    res.json(formattedBookings);

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
