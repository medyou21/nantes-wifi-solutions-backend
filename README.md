# 📡 Nantes WiFi Solutions — Backend API

API REST construite avec **Node.js**, **Express**, **TypeScript** et **MongoDB (Atlas)**.

---

## 🗂️ Structure du projet

```
nantes-wifi-solutions-backend/
├── src/
│   ├── config/
│   │   └── db.ts                  # Connexion MongoDB
│   ├── controllers/
│   │   ├── contact.controller.ts  # Logique métier contacts
│   │   └── offer.controller.ts    # Logique métier offres
│   ├── middlewares/
│   │   └── validation.middleware.ts
│   ├── models/
│   │   ├── contact.model.ts       # Schéma Mongoose Contact
│   │   └── offer.model.ts         # Schéma Mongoose Offer
│   ├── routes/
│   │   ├── contact.routes.ts
│   │   └── offer.routes.ts
│   ├── services/
│   │   └── mail.service.ts        # Envoi d'emails via Nodemailer
│   ├── app.ts                     # Configuration Express
│   └── index.ts                   # Point d'entrée
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Installation

### Prérequis

- Node.js >= 18
- Compte MongoDB Atlas (ou instance locale)
- Compte Gmail avec mot de passe d'application SMTP

### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/ton-compte/nantes-wifi-solutions-backend.git
cd nantes-wifi-solutions-backend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Lancer en développement
npm run dev
```

---


> ⚠️ Ne jamais commiter le fichier `.env`. Il est inclus dans `.gitignore`.

---

## 📜 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancement en développement avec rechargement automatique |
| `npm run build` | Compilation TypeScript vers `dist/` |
| `npm start` | Lancement en production depuis `dist/` |

---

## 🔌 Endpoints API

### Offres

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/offers` | Récupérer toutes les offres (seed automatique si vide) |

### Contacts

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/contacts` | Soumettre un formulaire de contact |

---

## 🌱 Seed automatique

Au premier appel `GET /api/offers`, si la base est vide, trois offres par défaut sont insérées automatiquement :

- **Formule Essentielle** — 29,99 €/mois
- **Formule Pro** — 59,99 €/mois
- **Formule Entreprise** — 99,99 €/mois

---

## 🛡️ Sécurité

- Rate limiting : 100 requêtes / 15 minutes par IP
- CORS restreint à l'origine frontend configurée
- Validation des données entrantes via middleware dédié

---

## 🧰 Stack technique

| Outil | Rôle |
|-------|------|
| Express | Framework HTTP |
| TypeScript | Typage statique |
| Mongoose | ODM MongoDB |
| Nodemailer | Envoi d'emails |
| dotenv | Gestion des variables d'environnement |
| express-rate-limit | Protection contre les abus |
| ts-node-dev | Rechargement automatique en développement |

---

## 📄 Licence

Projet privé — Nantes WiFi Solutions © 2026