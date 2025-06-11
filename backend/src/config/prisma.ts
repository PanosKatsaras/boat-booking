import { PrismaClient } from '@prisma/client';

// This client will be used throughout the application to interact with the database.
const prisma = new PrismaClient();

export default prisma;


