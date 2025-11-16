-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "deuxiemeTelephone" TEXT,
    "adresse" TEXT,
    "etat" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "permissions" TEXT,
    "imageProfil" TEXT,
    "businessId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "parcels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "destinataire" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "statutFacturation" TEXT NOT NULL,
    "typeColis" TEXT NOT NULL,
    "fraisLivraison" REAL NOT NULL,
    "montantTotal" REAL NOT NULL,
    "referenceColis" TEXT NOT NULL,
    "referenceVendeur" TEXT NOT NULL,
    "note" TEXT,
    "vendeurSecondaire" TEXT,
    "derniereAction" TEXT NOT NULL,
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    CONSTRAINT "parcels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "parcels_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pickups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "nombreColis" INTEGER NOT NULL DEFAULT 0,
    "dateDemande" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "frais" REAL NOT NULL DEFAULT 0,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "note" TEXT,
    "vendeurSecondaire" TEXT,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    CONSTRAINT "pickups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pickups_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sujet" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tickets_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "dateEmission" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invoices_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "returns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroColis" TEXT NOT NULL,
    "raison" TEXT NOT NULL,
    "dateDemande" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    CONSTRAINT "returns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "returns_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produit" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix" REAL NOT NULL,
    "dateAjout" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    CONSTRAINT "inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "dateAjout" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expediteur" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "dateEnvoi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "zoneId" INTEGER,
    "ville" TEXT NOT NULL,
    "name" TEXT,
    "arabicName" TEXT,
    "price" REAL NOT NULL,
    "delais" TEXT,
    "region" TEXT,
    "refusedCost" REAL NOT NULL DEFAULT 0,
    "canceledCost" REAL NOT NULL DEFAULT 0,
    "priceDriver" REAL,
    "refusedCostDriver" REAL NOT NULL DEFAULT 0,
    "active" TEXT,
    "driverId" TEXT,
    "pickerId" TEXT,
    "note" TEXT,
    "comment" TEXT,
    "pickupDistrict" TEXT,
    "minPickup" INTEGER NOT NULL DEFAULT 0,
    "feePickup" REAL NOT NULL DEFAULT 0,
    "feePickupDriver" REAL NOT NULL DEFAULT 0,
    "minPickupRequired" INTEGER NOT NULL DEFAULT 0,
    "pickupEndTime" TEXT,
    "allowNewDestination" TEXT,
    "deliveryDays" TEXT,
    "createdAt" TEXT,
    "updatedAt" DATETIME,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "api_keys_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastTriggeredAt" DATETIME,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    CONSTRAINT "webhooks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "webhooks_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessName" TEXT NOT NULL,
    "siteUrl" TEXT,
    "ville" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "etat" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_businesses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_businesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_businesses_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_businessId_idx" ON "users"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "parcels_code_key" ON "parcels"("code");

-- CreateIndex
CREATE INDEX "parcels_userId_idx" ON "parcels"("userId");

-- CreateIndex
CREATE INDEX "parcels_businessId_idx" ON "parcels"("businessId");

-- CreateIndex
CREATE INDEX "parcels_code_idx" ON "parcels"("code");

-- CreateIndex
CREATE INDEX "parcels_statut_idx" ON "parcels"("statut");

-- CreateIndex
CREATE INDEX "parcels_dateCreation_idx" ON "parcels"("dateCreation");

-- CreateIndex
CREATE UNIQUE INDEX "pickups_code_key" ON "pickups"("code");

-- CreateIndex
CREATE INDEX "pickups_userId_idx" ON "pickups"("userId");

-- CreateIndex
CREATE INDEX "pickups_businessId_idx" ON "pickups"("businessId");

-- CreateIndex
CREATE INDEX "pickups_code_idx" ON "pickups"("code");

-- CreateIndex
CREATE INDEX "pickups_dateDemande_idx" ON "pickups"("dateDemande");

-- CreateIndex
CREATE INDEX "tickets_userId_idx" ON "tickets"("userId");

-- CreateIndex
CREATE INDEX "tickets_businessId_idx" ON "tickets"("businessId");

-- CreateIndex
CREATE INDEX "tickets_statut_idx" ON "tickets"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_numero_key" ON "invoices"("numero");

-- CreateIndex
CREATE INDEX "invoices_userId_idx" ON "invoices"("userId");

-- CreateIndex
CREATE INDEX "invoices_businessId_idx" ON "invoices"("businessId");

-- CreateIndex
CREATE INDEX "invoices_numero_idx" ON "invoices"("numero");

-- CreateIndex
CREATE INDEX "returns_userId_idx" ON "returns"("userId");

-- CreateIndex
CREATE INDEX "returns_businessId_idx" ON "returns"("businessId");

-- CreateIndex
CREATE INDEX "returns_numeroColis_idx" ON "returns"("numeroColis");

-- CreateIndex
CREATE INDEX "inventory_userId_idx" ON "inventory"("userId");

-- CreateIndex
CREATE INDEX "inventory_businessId_idx" ON "inventory"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_email_key" ON "team_members"("email");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- CreateIndex
CREATE INDEX "messages_userId_idx" ON "messages"("userId");

-- CreateIndex
CREATE INDEX "messages_lu_idx" ON "messages"("lu");

-- CreateIndex
CREATE INDEX "cities_ville_idx" ON "cities"("ville");

-- CreateIndex
CREATE INDEX "cities_region_idx" ON "cities"("region");

-- CreateIndex
CREATE INDEX "cities_active_idx" ON "cities"("active");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_userId_idx" ON "api_keys"("userId");

-- CreateIndex
CREATE INDEX "api_keys_businessId_idx" ON "api_keys"("businessId");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "webhooks_secretKey_key" ON "webhooks"("secretKey");

-- CreateIndex
CREATE INDEX "webhooks_userId_idx" ON "webhooks"("userId");

-- CreateIndex
CREATE INDEX "webhooks_businessId_idx" ON "webhooks"("businessId");

-- CreateIndex
CREATE INDEX "webhooks_event_idx" ON "webhooks"("event");

-- CreateIndex
CREATE INDEX "webhooks_active_idx" ON "webhooks"("active");

-- CreateIndex
CREATE INDEX "businesses_businessName_idx" ON "businesses"("businessName");

-- CreateIndex
CREATE INDEX "businesses_etat_idx" ON "businesses"("etat");

-- CreateIndex
CREATE UNIQUE INDEX "user_businesses_userId_businessId_key" ON "user_businesses"("userId", "businessId");

-- CreateIndex
CREATE INDEX "user_businesses_userId_idx" ON "user_businesses"("userId");

-- CreateIndex
CREATE INDEX "user_businesses_businessId_idx" ON "user_businesses"("businessId");

