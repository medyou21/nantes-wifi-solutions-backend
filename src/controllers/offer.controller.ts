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

const parseOfferId = (value: string): number | null => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/** Liste complète destinée au back-office, y compris les offres désactivées. */
export const getAdminOffers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const offers = await prisma.offer.findMany({
      include: { service: { select: { slug: true, name: true } } },
      orderBy: { displayOrder: "asc" },
    });
    return res.json(offers.map(({ priceCents, ...offer }) => ({
      ...offer,
      price: priceCents / 100,
    })));
  } catch {
    return res.status(500).json({ message: "Erreur lors du chargement des offres." });
  }
};

/** CREATE SQL : crée une offre et vérifie la clé étrangère Service. */
export const createOffer = async (req: Request, res: Response): Promise<Response> => {
  const { price, serviceSlug, ...data } = req.body;
  try {
    const offer = await prisma.offer.create({
      data: {
        ...data,
        priceCents: Math.round(price * 100),
        service: { connect: { slug: serviceSlug } },
      },
      include: { service: { select: { slug: true, name: true } } },
    });
    return res.status(201).json(offer);
  } catch {
    return res.status(409).json({ message: "Titre déjà utilisé ou service inexistant." });
  }
};

/** UPDATE SQL : modifie uniquement les champs explicitement fournis. */
export const updateOffer = async (req: Request, res: Response): Promise<Response> => {
  const id = parseOfferId(req.params.id);
  if (!id) return res.status(400).json({ message: "Identifiant d'offre invalide." });

  const { price, serviceSlug, ...fields } = req.body;
  const data = {
    ...fields,
    ...(price !== undefined ? { priceCents: Math.round(price * 100) } : {}),
    ...(serviceSlug ? { service: { connect: { slug: serviceSlug } } } : {}),
  };
  try {
    const offer = await prisma.offer.update({ where: { id }, data });
    return res.json(offer);
  } catch {
    return res.status(404).json({ message: "Offre ou service introuvable." });
  }
};

/** DELETE SQL : suppression réelle, réservée à l'administrateur authentifié. */
export const deleteOffer = async (req: Request, res: Response): Promise<Response> => {
  const id = parseOfferId(req.params.id);
  if (!id) return res.status(400).json({ message: "Identifiant d'offre invalide." });
  try {
    await prisma.offer.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ message: "Offre introuvable." });
  }
};
