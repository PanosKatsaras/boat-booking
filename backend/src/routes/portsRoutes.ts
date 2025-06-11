import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Fetches all ports from the database.
router.get('/', async (req, res) => {
  try {
    const ports = await prisma.port.findMany({
    include: { boats: true },
      orderBy: { name: 'asc' },
    });
    res.json(ports);
  } catch (error) {
    console.error('Error fetching all ports:', error);
    res.status(500).json({ message: 'Failed to fetch ports.' });
  }
});

// Delete port by id.
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {

    const deletedPort = await prisma.port.delete({
      where: { id },
    });
    res.json({ message: `Port '${deletedPort.name}' successfully deleted.`, port: deletedPort });
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error code for record not found
      return res.status(404).json({ message: 'Port not found.' });
    }
    console.error(`Error deleting port with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete port.' });
  }
});

export default router;