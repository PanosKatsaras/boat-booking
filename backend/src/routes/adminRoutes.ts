import { Router } from 'express';
import prisma from '../config/prisma'; // Prisma client
import { authenticateJWT } from '../middleware/auth'; // JWT authentication middleware
import { authorizeRole } from '../middleware/authorize'; // Role authorization middleware
import { BoatType, Role } from '@prisma/client'; // Enums
import bcrypt from 'bcryptjs'; // bcrypt for password hashing

const router = Router();


// This route is protected and requires an 'ADMIN' role.
router.post('/boats', authenticateJWT, authorizeRole([Role.ADMIN]), async (req, res) => {
  // Destructure boat properties from the request body
  const { name, type, portId, imageUrl, hourlyRate, halfDayRate, fullDayRate } = req.body;

  // Basic validation: Check for required fields
  if (!name || !type || !portId || hourlyRate === undefined || halfDayRate === undefined || fullDayRate === undefined) {
    return res.status(400).json({ message: 'Missing required boat fields.' });
  }

  // Validate boat type against the enum
  if (!Object.values(BoatType).includes(type)) {
    return res.status(400).json({ message: `Invalid boat type: ${type}. Must be one of ${Object.values(BoatType).join(', ')}` });
  }

  try {
    // Ensure the specified portId exists before creating the boat
    const existingPort = await prisma.port.findUnique({
      where: { id: portId },
    });
    if (!existingPort) {
      return res.status(404).json({ message: `Port with ID ${portId} not found.` });
    }

    // Create the new boat in the database using Prisma
    const newBoat = await prisma.boat.create({
      data: {
        name,
        type: type, // Assign validated enum value
        portId,
        imageUrl,  // Optional, can be null
        hourlyRate,
        halfDayRate,
        fullDayRate,
      },
    });

    // Respond with the newly created boat object
    res.status(201).json(newBoat);

  } catch (error) {
    console.error('Error creating boat:', error);
    // Generic internal server error response
    res.status(500).json({ message: 'Failed to create boat.' });
  }
});

// This route is protected and requires an 'ADMIN' role.
router.get('/boats', authenticateJWT, authorizeRole([Role.ADMIN]), async (req, res) => {
  try {
    const boats = await prisma.boat.findMany({
      include: { port: true }, // Include port details for display
      orderBy: { name: 'asc' },
    });
    res.json(boats);
  } catch (error) {
    console.error('Error fetching all boats for admin:', error);
    res.status(500).json({ message: 'Failed to fetch boats.' });
  }
});


// This route is protected and requires an 'ADMIN' role.
router.delete('/boats/:id', authenticateJWT, authorizeRole([Role.ADMIN]), async (req, res) => {
  const { id } = req.params; // Get boat ID from URL parameters

  try {
    // Delete the boat from the database using Prisma
    // Due to onDelete: SetNull on Booking.boatId, associated bookings will have boatId set to null.
    const deletedBoat = await prisma.boat.delete({
      where: { id: id },
    });

    // Respond with a success message and the deleted boat object
    res.json({ message: `Boat "${deletedBoat.name}" deleted successfully.`, boat: deletedBoat });

  } catch (error: any) {
    // Handle specific Prisma errors, P2025 if boat ID not found
    if (error.code === 'P2025') {
      return res.status(404).json({ message: `Boat with ID ${id} not found.` });
    }
    // P2003 is foreign key constraint.
    if (error.code === 'P2003') {
      console.warn(`Foreign key constraint issue when deleting boat ${id}. Ensure all related bookings/other entities allow SetNull or Cascade.`, error);
      return res.status(409).json({ message: `Cannot delete boat ${id}: Referenced by other records (e.g., non-nullable foreign keys in other tables or unhandled dependencies).` });
    }
    console.error(`Error deleting boat ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete boat.' });
  }
});

// New endpoint to create new port for Admin Dashboard
router.post('/ports', authenticateJWT, authorizeRole([Role.ADMIN]), async (req, res) => {
  // Destructure boat properties from the request body
  const { name, latitude, longitude } = req.body;

  // Basic validation: Check for required fields
  if (!name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Missing required port fields.' });
  }
  try {
    // Create the new port in the database using Prisma
    const newPort = await prisma.port.create({
      data: {
        name,
        latitude,
        longitude
      },
    });

    // Respond with the newly created port object
    res.status(201).json(newPort);

  } catch (error) {
    console.error('Error creating port:', error);
    // Generic internal server error response
    res.status(500).json({ message: 'Failed to create port.' });
  }
});

// New endpoint to fetch all ports for Admin Dashboard
router.get('/ports', authenticateJWT, authorizeRole([Role.ADMIN]), async (req, res) => {
  try {
    const ports = await prisma.port.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(ports);
  } catch (error) {
    console.error('Error fetching all ports for admin:', error);
    res.status(500).json({ message: 'Failed to fetch ports.' });
  }
});

// New endpoint to delete a port for Admin Dashboard
router.delete('/ports/:id', authenticateJWT, authorizeRole([Role.ADMIN]), async (req, res) => {
  const { id } = req.params; // Get port ID from URL parameters

  try {
    // Delete the port from the database.
    // This will set `portId` to `null` in associated `Booking` records due to `onDelete: SetNull`.
    const deletedPort = await prisma.port.delete({
      where: { id: id },
      select: { // Select fields of the deleted port to return
        id: true,
        name: true
      },
    });

    res.json({ message: `Port "${deletedPort.name}" deleted successfully.`, port: deletedPort });

  } catch (error: any) {
    if (error.code === 'P2025') { // Port ID not found
      return res.status(404).json({ message: `Port with ID ${id} not found.` });
    }
    console.error(`Error deleting port ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete port.' });
  }
});

// This route is protected and requires an 'ADMIN' or 'MANAGER' role.
router.get('/users', authenticateJWT, authorizeRole([Role.ADMIN, Role.MANAGER]), async (req, res) => {
  try {
    // Fetch all users, excluding their passwords for security
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// This route is protected and requires an 'ADMIN' role.
// Expects 'name', 'email', 'password' (optional), 'role' (optional) in the request body.
router.put('/users/:id', authenticateJWT, authorizeRole([Role.ADMIN]), async (req, res) => {
  const { id } = req.params; // Get user ID from URL parameters
  const { name, email, password, role } = req.body; // Get fields to update from request body

  const updateData: {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
  } = {};

  // Fields to updateData if they are provided in the request body
  // Check for undefined fields
  if (name !== undefined) {
    updateData.name = name;
  }
  if (email !== undefined) {
    updateData.email = email;
  }
  if (password !== undefined) {
    // Hash password if it's provided for update
    updateData.password = await bcrypt.hash(password, 10);
  }
  if (role !== undefined) {
    // Validate role against the Role enum if provided
    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ message: `Invalid role: ${role}. Must be one of ${Object.values(Role).join(', ')}` });
    }
    updateData.role = role;
  }

  // If no fields are provided for update
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: 'No fields provided for update.' });
  }

  try {
    // Update the user's details in the database
    const updatedUser = await prisma.user.update({
      where: { id: id }, // Find user by ID
      data: updateData,
      select: { // Select specific fields to return
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Respond with the updated user information
    res.json({ message: `User ${updatedUser.email} updated successfully.`, user: updatedUser });

  } catch (error: any) {
    // Handle specific Prisma errors
    if (error.code === 'P2025') { // User ID not found
      return res.status(404).json({ message: `User with ID ${id} not found.` });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) { // Email unique constraint violation
      return res.status(409).json({ message: 'Email already in use by another user.' });
    }
    console.error(`Error updating user ${id}:`, error);
    res.status(500).json({ message: 'Failed to update user.' });
  }
});

// This route is protected and requires an 'ADMIN' role.
// This will set `userId` to `null` in associated `Booking` records due to `onDelete: SetNull`.
router.delete('/users/:id', authenticateJWT, authorizeRole([Role.ADMIN]), async (req, res) => {
  const { id } = req.params; // Get user ID from URL parameters

  // Prevent admin from deleting themselves
  if (req.user && req.user.id === id) {
    return res.status(403).json({ message: 'Admins cannot delete their own account via this endpoint.' });
  }

  try {
    // Delete the user from the database.
    // This will set `userId` to `null` in associated `Booking` records due to `onDelete: SetNull`.
    const deletedUser = await prisma.user.delete({
      where: { id: id },
      select: { // Select fields of the deleted user to return
        id: true,
        email: true,
        name: true,
      },
    });

    res.json({ message: `User "${deletedUser.email}" deleted successfully.`, user: deletedUser });

  } catch (error: any) {
    if (error.code === 'P2025') { // User ID not found
      return res.status(404).json({ message: `User with ID ${id} not found.` });
    }
    console.error(`Error deleting user ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
});

// Change the role of a specific user.
// This route is protected and requires an 'ADMIN' role.
router.put('/users/:id/role', authenticateJWT, authorizeRole([Role.ADMIN]), async (req, res) => {
  const { id } = req.params; // Get user ID from URL parameters
  const { newRole } = req.body; // Get new role from request body

  // Basic validation for newRole
  if (!newRole) {
    return res.status(400).json({ message: 'New role is required.' });
  }

  // Validate newRole against the Role enum
  // Object.values(Role) gives an array of the string values of the enum ('ADMIN', 'USER', 'MANAGER')
  if (!Object.values(Role).includes(newRole)) {
    return res.status(400).json({ message: `Invalid role: ${newRole}. Must be one of ${Object.values(Role).join(', ')}` });
  }

  try {
    // Update the user's role in the database
    const updatedUser = await prisma.user.update({
      where: { id: id }, // Find user by ID
      data: {
        role: newRole as Role, // Assign the new role (cast to Role enum type)
      },
      select: { // Select specific fields to return
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Respond with the updated user information
    res.json({ message: `User ${updatedUser.email} role updated to ${updatedUser.role}`, user: updatedUser });

  } catch (error: any) {
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({ message: `User with ID ${id} not found.` });
    }
    console.error(`Error changing role for user ${id}:`, error);
    res.status(500).json({ message: 'Failed to change user role.' });
  }
});

// GET /api/admin/bookings (New endpoint to fetch all bookings for Admin/Manager Dashboard)
router.get('/bookings', authenticateJWT, authorizeRole([Role.ADMIN, Role.MANAGER]), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        boat: true,
        port: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings for admin:', error);
    res.status(500).json({ message: 'Failed to fetch bookings.' });
  }
});

export default router;
