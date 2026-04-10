import { Request, Response, NextFunction } from 'express';

export const validateContact = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, message } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ message: 'Le nom est requis (minimum 2 caractères).' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ message: 'Email invalide.' });
    return;
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    res.status(400).json({ message: 'Le message est requis (minimum 10 caractères).' });
    return;
  }

  next();
};
