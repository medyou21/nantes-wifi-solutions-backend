import type { Request, Response, NextFunction } from "express";

// Récursif : nettoie toutes les strings d'un objet
const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "") // scripts
      .replace(/<[^>]+>/g, "")                              // balises HTML
      .replace(/javascript:/gi, "")                         // js: links
      .replace(/on\w+\s*=/gi, "")                           // on* handlers
      .trim();
  }

  if (Array.isArray(value)) return value.map(sanitizeValue);

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        sanitizeValue(v),
      ])
    );
  }

  return value;
};

export const sanitizeBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  next();
};