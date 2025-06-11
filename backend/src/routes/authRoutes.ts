import { Router } from 'express'; 
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma'; // Prisma client instance
import { generateAccessToken, setHttpOnlyJwtCookie, clearJwtCookie } from '../utils/jwt';
import { Role } from '@prisma/client'; // Role enum

// Router constant as an Express Router
const router: Router = Router();

// Sets an httpOnly JWT cookie upon successful registration.
// The first user registered will automatically be assigned the 'ADMIN' role.
router.post('/register', async (req, res) => { 
  const { email, password, name } = req.body;

  // Basic input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Determine the role for the new user
    // Count existing users to check if this is the very first registration
    const userCount = await prisma.user.count();
    const assignedRole: Role = userCount === 0 ? Role.ADMIN : Role.USER;

    // Hashed password before storing it in the database for security
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // New user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0], // Provided name or default to part of email
        role: assignedRole,
      },
    });

    // A JWT for the newly registered user
    const token = generateAccessToken(user);
    // The JWT as an httpOnly cookie in the response
    setHttpOnlyJwtCookie(res, token);

    // Respond with a success message and basic user details (excluding hashed password)
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });

  } catch (error: any) {
    // Unique constraint violation for email (P2002 is Prisma's error code for unique constraint)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    // Error for debugging purposes
    console.error('Registration error:', error);
    // Internal server error response
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Authenticate a user and provide access token.
// Validates email and password, generates an httpOnly JWT cookie on success.
router.post('/login', async (req, res) => { // Explicitly type req and res parameters
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find the user by email in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Fail message if user not found or password doesn't exist
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Fail message if passwords do not match
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT for the authenticated user
    const token = generateAccessToken(user);
    // Set the JWT as an httpOnly cookie in the response
    setHttpOnlyJwtCookie(res, token);

    // A success message and basic user details (excluding hashed password)
    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logs out the user by clearing the httpOnly JWT cookie.
router.post('/logout', (req, res) => { 
  clearJwtCookie(res); // Clear the JWT cookie from the client
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
