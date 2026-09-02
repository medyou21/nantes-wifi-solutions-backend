import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getOffers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const offers = await prisma.offer.findMany({
      where: { active: true },
      include: { service: { select: { slug: true, name: true } } },
      orderBy: { displayOrder: "asc" },
    });

    res.status(200).json(
      offers.map((offer) => ({
        id: offer.id,
        title: offer.title,
        price: offer.priceCents / 100,
        description: offer.description,
        features: offer.features,
        highlight: offer.highlighted,
        service: offer.service,
      })),
    );
  } catch (error) {
    console.error("Erreur SQL lors de la récupération des offres", error);
    res.status(500).json({ message: "Erreur lors de la récupération des offres." });
  }
};
