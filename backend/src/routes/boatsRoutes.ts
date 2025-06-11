// backend/routes/boatsRoutes.ts
import { Router } from 'express';
import prisma from '../config/prisma';
const router = Router();

// Fetch all available boats
router.get('/',  async (req, res) => {
  try {
    const boats = await prisma.boat.findMany({
      include: { port: true }, // Include port details for display
      orderBy: { name: 'asc' },
    });
    res.status(200).json(boats);
  } catch (error) {
    console.error('Error fetching all boats for admin:', error);
    res.status(500).json({ message: 'Failed to fetch boats.' });
  }
});

export default router;
