import dotenv from 'dotenv';
dotenv.config(); // ← doit être en premier, avant tous les autres imports

import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  });
};

start();