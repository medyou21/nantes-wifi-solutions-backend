CREATE TABLE "Admin" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Service" (
  "id" SERIAL PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Offer" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL UNIQUE,
  "priceCents" INTEGER NOT NULL CHECK ("priceCents" >= 0),
  "description" TEXT NOT NULL,
  "features" TEXT[] NOT NULL,
  "highlighted" BOOLEAN NOT NULL DEFAULT FALSE,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "serviceId" INTEGER NOT NULL REFERENCES "Service"("id") ON DELETE RESTRICT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "Offer_serviceId_idx" ON "Offer"("serviceId");
CREATE INDEX "Offer_active_displayOrder_idx" ON "Offer"("active", "displayOrder");
