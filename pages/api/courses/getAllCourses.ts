// pages/api/courses.ts

import { NextApiRequest, NextApiResponse } from 'next';
import cors from '../../../lib/cors-middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAllCourses(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.course.count({ where: { deletedAt: null } }),
  ]);
  return { data: courses, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

async function handleGetAllCourses(req: NextApiRequest, res: NextApiResponse) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit as string) || 50));
    const result = await getAllCourses(page, limit);
    return res.status(200).json(result);
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