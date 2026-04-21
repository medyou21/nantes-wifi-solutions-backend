📡 Nantes WiFi Solutions — Backend API

API REST sécurisée et scalable développée avec Node.js, Express, TypeScript et MongoDB Atlas.

Elle gère :

📩 formulaires de contact
📦 offres commerciales
📧 génération et envoi de devis PDF
🔐 authentification admin (JWT)
🗂️ Architecture du projet
nantes-wifi-solutions-backend/
├── src/
│   ├── config/                # Configuration (DB, CORS, rate limit)
│   │   ├── db.ts
│   │   ├── cors.config.ts
│   │   └── rateLimit.config.ts
│   │
│   ├── controllers/           # Logique métier (API handlers)
│   │   ├── contact.controller.ts
│   │   ├── offer.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── middlewares/           # Middlewares (auth, validation, sécurité)
│   │   ├── validate.middleware.ts
│   │   ├── sanitize.middleware.ts
│   │   └── auth.middleware.ts
│   │
│   ├── models/                # Schémas MongoDB (Mongoose)
│   │   ├── contact.model.ts
│   │   ├── offer.model.ts
│   │   └── admin.model.ts
│   │
│   ├── routes/                # Routes API
│   │   ├── contact.routes.ts
│   │   ├── offer.routes.ts
│   │   └── admin.routes.ts
│   │
│   ├── services/              # Services métier
│   │   ├── mail.service.ts    # Envoi emails (Brevo)
│   │   ├── pdf.service.ts     # Génération devis PDF
│   │   └── jwt.service.ts     # Auth JWT
│   │
│   ├── validators/            # Schémas Zod
│   │   ├── contact.validator.ts
│   │   └── auth.validator.ts
│   │
│   ├── app.ts                 # Configuration Express
│   └── index.ts               # Point d’entrée serveur
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
🚀 Installation
📌 Prérequis
Node.js >= 18
MongoDB Atlas (ou local)
Compte Brevo (SMTP / API email)
⚙️ Étapes
# 1. Cloner le projet
git clone https://github.com/ton-compte/nantes-wifi-solutions-backend.git
cd nantes-wifi-solutions-backend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d’environnement
cp .env.example .env

# 4. Lancer en développement
npm run dev
🔐 Variables d’environnement

Créer un fichier .env :

PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_uri
CLIENT_URL=http://localhost:5173

BREVO_API_KEY=your_brevo_api_key
MAIL_FROM=contact@domain.com
MAIL_TO=admin@domain.com

JWT_SECRET=your_jwt_secret


📜 Scripts disponibles
Commande	Description
npm run dev	Lancement développement (hot reload)
npm run build	Compilation TypeScript
npm start	Lancement production


🔌 API Endpoints
📦 Offres
Méthode	Route	Description
GET	/api/offers	Liste des offres
📩 Contacts
Méthode	Route	Description
POST	/api/contacts	Envoyer un message + génération devis PDF
🔐 Admin
Méthode	Route	Description
POST	/api/admin/login	Connexion admin
GET	/api/admin/contacts	Liste des contacts (protégé JWT)
📄 Génération de devis (PDF)

Lorsqu’un contact est envoyé :

génération automatique d’un devis PDF personnalisé
envoi email au client
envoi email à l’admin
numéro de devis unique (DEV-YYYYMM-XXXX)
🛡️ Sécurité

✔ Helmet (headers HTTP sécurisés)
✔ CORS configuré
✔ Rate limiting (anti spam / brute force)
✔ Sanitization NoSQL injection
✔ Validation Zod (backend strict)
✔ JWT authentication

🧠 Stack technique
Technologie	Rôle
Express	API REST
TypeScript	Typage fort
MongoDB + Mongoose	Base de données
Zod	Validation données
Brevo API	Emails transactionnels
PDFKit	Génération devis PDF
JWT	Authentification
dotenv	Variables d’environnement
🚀 Améliorations possibles (roadmap)
🔔 notifications Slack / Discord
📊 dashboard admin (React)
📦 stockage PDF (S3 / Cloudinary)
🧠 scoring automatique des leads
📈 analytics des demandes
🐳 Docker + CI/CD
📄 Licence

Projet privé — Nantes WiFi Solutions © 2026