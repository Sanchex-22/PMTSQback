// src/db/courses.ts (or prisma/courses.ts, depending on your project structure)

import { PrismaClient, Course, Prisma } from '@prisma/client';

// Instantiate PrismaClient once and reuse it.
// It's recommended to have a single PrismaClient instance for your application lifecycle.
const prisma = new PrismaClient();

/**
 * Retrieves all courses from the database.
 * @returns A promise that resolves to an array of Course objects.
 */
export async function getAllCourses(): Promise<Course[]> {
  try {
    const courses = await prisma.course.findMany();
    return courses;
  } catch (error) {
    console.error("Error fetching all courses:", error);
    // Re-throw the error so the calling function can handle it appropriately
    throw error;
  }
}

/**
 * Retrieves a single course by its unique ID.
 * @param id The ID of the course to retrieve.
 * @returns A promise that resolves to a Course object if found, or null otherwise.
 */
export async function getCourseById(id: number): Promise<Course | null> {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: id,
      },
    });
    return course;
  } catch (error) {
    console.error(`Error fetching course with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Creates a new course in the database.
 * Note: The 'id' is auto-incremented, so we don't include it in the input.
 * @param data The data for the new course.
 * @returns A promise that resolves to the newly created Course object.
 */
export async function createCourse(
  data: Omit<Prisma.CourseCreateInput, 'id'> // Omit 'id' as it's auto-incremented
): Promise<Course> {
  try {
    // Ensure price fields are not null, defaulting to 0 if they are
    const validatedData = {
      ...data,
      price_panamanian: data.price_panamanian ?? 0,
      price_panamanian_renewal: data.price_panamanian_renewal ?? 0,
      price_foreign: data.price_foreign ?? 0,
      price_foreign_renewal: data.price_foreign_renewal ?? 0,
    };

    const newCourse = await prisma.course.create({
      data: validatedData,
    });
    return newCourse;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
}

/**
 * Updates an existing course in the database.
 * @param id The ID of the course to update.
 * @param data The data to update (partial update allowed).
 * @returns A promise that resolves to the updated Course object.
 */
export async function updateCourse(
  id: number,
  data: Prisma.CourseUpdateInput // Allows partial updates
): Promise<Course> {
  try {
    const updatedCourse = await prisma.course.update({
      where: {
        id: id,
      },
      data: data,
    });
    return updatedCourse;
  } catch (error) {
    console.error(`Error updating course with ID ${id}:`, error);
    // Prisma will throw PrismaClientKnownRequestError if record not found (P2025)
    throw error;
  }
}

/**
 * Deletes a course from the database by its ID.
 * @param id The ID of the course to delete.
 * @returns A promise that resolves to the deleted Course object.
 */
export async function deleteCourse(id: number): Promise<Course> {
  try {
    const deletedCourse = await prisma.course.delete({
      where: {
        id: id,
      },
    });
    return deletedCourse;
  } catch (error) {
    console.error(`Error deleting course with ID ${id}:`, error);
    // Prisma will throw PrismaClientKnownRequestError if record not found (P2025)
    throw error;
  }
}

// Optional: Example usage for testing (this code will only run if you run this file directly)
async function main() {
  console.log("--- Testing Course DB Operations ---");

  // 1. Get all courses
  console.log("\nGetting all courses:");
  const allCourses = await getAllCourses();
  console.log(`Found ${allCourses.length} courses.`);
  // console.log(allCourses); // Uncomment to see all course data

  // 2. Get a specific course (e.g., the first one)
  if (allCourses.length > 0) {
    const firstCourseId = allCourses[0].id;
    console.log(`\nGetting course with ID ${firstCourseId}:`);
    const course = await getCourseById(firstCourseId);
    if (course) {
      console.log(`Found course: ${course.name}`);
    } else {
      console.log(`Course with ID ${firstCourseId} not found.`);
    }

    // 3. Update a course
    console.log(`\nUpdating course with ID ${firstCourseId}:`);
    try {
      const updatedCourse = await updateCourse(firstCourseId, {
        name: `${course?.name} - UPDATED`,
        price_panamanian: 999.99,
      });
      console.log(`Updated course: ${updatedCourse.name}, Price: ${updatedCourse.price_panamanian}`);
    } catch (error) {
      console.error("Failed to update course in test:", error);
    }
  }

  // 4. Create a new course
  console.log("\nCreating a new course:");
  try {
    const newCourseData = {
      name: "New Test Course",
      abbr: "NTC",
      imo_no: "IMO12345",
      price_panamanian: 150.00,
      price_panamanian_renewal: 75.00,
      price_foreign: 300.00,
      price_foreign_renewal: 150.00,
    };
    const createdCourse = await createCourse(newCourseData);
    console.log(`Created new course: ${createdCourse.name} with ID ${createdCourse.id}`);

    // 5. Delete the newly created course
    console.log(`\nDeleting course with ID ${createdCourse.id}:`);
    const deletedCourse = await deleteCourse(createdCourse.id);
    console.log(`Deleted course: ${deletedCourse.name}`);
  } catch (error) {
    console.error("Failed to create or delete course in test:", error);
  }

  console.log("\n--- Testing finished ---");
}

// Run the main function if this file is executed directly (e.g., for testing)
// This pattern prevents it from running automatically when imported by another file.
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}