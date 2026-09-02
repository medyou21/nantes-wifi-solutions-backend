import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) throw new Error("MONGO_URI manquant");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL manquant");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET manquant");

import app from "./app";
import connectDB from "./config/db";
import { connectSQL, disconnectSQL } from "./config/prisma";

const PORT = process.env.PORT || 5000;

const start = async (): Promise<void> => {
  try {
    await Promise.all([connectDB(), connectSQL()]);
    console.log("MongoDB et PostgreSQL connectés");

    const server = app.listen(PORT, () => {
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
    });

    const shutdown = async (): Promise<void> => {
      server.close(async () => {
        await disconnectSQL();
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Erreur au démarrage du serveur :", error);
    await disconnectSQL().catch(() => undefined);
    process.exit(1);
  }
};

void start();
