import { PrismaClient, Instructor } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Retrieves all courses from the database.
 * @returns A promise that resolves to an array of Course objects.
 */
export async function getAllInstructor(): Promise<Instructor[]> {
  try {
    const instructor = await prisma.instructor.findMany();
    return instructor;
  } catch (error) {
    console.error("Error fetching all courses:", error);
    // Re-throw the error so the calling function can handle it appropriately
    throw error;
  }
}
