import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import contactRoutes from './routes/contact.routes';
import offerRoutes from './routes/offer.routes';
import adminRoutes from "./routes/admin.routes";



const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
   origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
});
app.use(limiter);

// Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/offers', offerRoutes);
app.use("/api/admin", adminRoutes);

export default app;
