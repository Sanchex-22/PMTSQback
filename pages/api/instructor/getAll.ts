// pages/api/cron/expire-quotations.ts
import { PrismaClient } from "@prisma/client";
import cors from "../../../lib/cors-middleware";
const dotenv = require("dotenv"); // Asegúrate de que dotenv esté configurado para este archivo
dotenv.config();

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
    await cors(req, res);
}