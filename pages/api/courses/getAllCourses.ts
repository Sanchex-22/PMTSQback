// pages/api/courses.ts

import { NextApiRequest, NextApiResponse } from 'next';
import {
  getAllCourses,
  // getCourseById, // Not needed for 'get all' functionality
  // createCourse, // Not needed for 'get all' functionality
  // updateCourse, // Not needed for 'get all' functionality
  // deleteCourse, // Not needed for 'get all' functionality
} from '../../../db/courses'; // Adjust path if your 'src/db/courses.ts' is elsewhere
import initMiddleware from '../../../lib/init-middleware';
import Cors from "cors";

const cors = initMiddleware(
  Cors({
    methods: ["POST", "GET", "OPTIONS"],
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://pmts-quote.vercel.app",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No autorizado por CORS"));
      }
    },
  })
);
async function handleGetAllCourses(req: NextApiRequest, res: NextApiResponse) {
  try {
    const courses = await getAllCourses(); // Call the function from '../../../src/db/courses'
    return res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching all courses:', error);
    return res.status(500).json({ error: 'Failed to retrieve courses.' });
  }
}

// Main handler function for the Next.js API route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply CORS middleware if you have it (uncomment if using)
  await cors(req, res);

  // Handle OPTIONS method for CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*'); // Be specific in production
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Only GET and OPTIONS allowed now
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Add other headers if needed
    return res.status(200).end();
  }

  // Route requests to the appropriate handler function based on HTTP method
  switch (req.method) {
    case 'GET':
      // Directly call the function to get all courses
      return await handleGetAllCourses(req, res);
    default:
      // If the HTTP method is not handled (only GET is handled now)
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}