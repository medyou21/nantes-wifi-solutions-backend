# Nantes WiFi Solutions - API

API REST du projet de certification DWWM de Mohamed HAMDI.

## Architecture de données

Le projet démontre volontairement les deux familles de bases demandées par le référentiel :

- **MongoDB / Mongoose (NoSQL)** : demandes de contact et messages à structure évolutive ;
- **PostgreSQL / Prisma (SQL relationnel)** : administrateurs, services et offres commerciales ;
- relation SQL **Service 1,N Offre**, clés étrangères, contraintes, index et migration versionnée.

## Fonctionnalités

- création et validation des demandes de contact ;
- catalogue d'offres lu depuis PostgreSQL ;
- authentification administrateur avec mot de passe bcrypt et JWT ;
- consultation sécurisée des contacts MongoDB ;
- génération de devis PDF et notifications email ;
- Helmet, CORS, rate limiting, validation Zod et nettoyage des entrées.

## Prérequis

- Node.js 20.19 ou supérieur ;
- Docker Desktop, ou des instances locales de PostgreSQL et MongoDB.

## Installation

```bash
git clone https://github.com/medyou21/nantes-wifi-solutions-backend.git
cd nantes-wifi-solutions-backend
git switch certification-dwwm
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run dev
```

L'API écoute par défaut sur `http://localhost:5000`.

## Variables d'environnement

| Variable | Usage |
|---|---|
| `MONGO_URI` | Connexion MongoDB des contacts |
| `DATABASE_URL` | Connexion PostgreSQL Prisma |
| `JWT_SECRET` | Signature des jetons |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Création du compte par le seed |
| `CLIENT_URL` | Origine frontend autorisée |
| `BREVO_API_KEY` | Envoi d'emails |
| `MAIL_FROM` / `MAIL_TO` | Expéditeur et destinataire |

Ne jamais enregistrer le fichier `.env` dans Git.

## API

| Méthode | Route | Accès | Stockage |
|---|---|---|---|
| POST | `/api/contacts` | Public, limité | MongoDB |
| GET | `/api/offers` | Public | PostgreSQL |
| POST | `/api/admin/login` | Public, limité | PostgreSQL |
| GET | `/api/admin/contacts` | JWT | MongoDB |

## Modèle relationnel

```text
ADMIN
- id (PK)
- email (UNIQUE)
- passwordHash
- role
- active

SERVICE 1 ───── N OFFER
- id (PK)        - id (PK)
- slug UNIQUE    - serviceId (FK)
- name           - title UNIQUE
                  - priceCents
```

Le schéma Prisma est dans `prisma/schema.prisma`. La migration SQL explicite se trouve dans `prisma/migrations/`.

## Structure

```text
prisma/
  schema.prisma
  seed.ts
  migrations/
src/
  config/        # MongoDB, PostgreSQL, CORS, limites
  controllers/   # composants métier
  middlewares/   # sécurité et validation
  models/        # documents MongoDB
  routes/        # endpoints REST
  services/      # email et PDF
tests/
```

## Vérification

```bash
npm run build
npm test
```

Le test de santé vérifie notamment le comportement contrôlé des routes inconnues.

## Choix techniques à présenter au jury

- MongoDB convient aux demandes de contact, dont le contenu peut évoluer.
- PostgreSQL garantit l'intégrité du catalogue et des comptes administrateurs.
- Prisma fournit un accès typé, des migrations reproductibles et des requêtes SQL sécurisées.
- Les secrets sont externalisés dans les variables d'environnement.
