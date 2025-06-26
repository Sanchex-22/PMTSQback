// lib/cors.js

import Cors from 'cors';
import initMiddleware from './init-middleware';

// Aquí está tu configuración de CORS
const cors = initMiddleware(
  Cors({
    methods: ["POST", "GET", "OPTIONS"],
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://pmts-quote.vercel.app",
        "https://quote.panamamaritimetraining.com",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No autorizado por CORS"));
      }
    },
  })
);

export default cors;