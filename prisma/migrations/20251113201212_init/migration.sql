-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "nomMarque" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    CONSTRAINT "parcels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    CONSTRAINT "pickups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sujet" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "dateCreation" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "dateEmission" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "returns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroColis" TEXT NOT NULL,
    "raison" TEXT NOT NULL,
    "dateDemande" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "returns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produit" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prix" REAL NOT NULL,
    "dateAjout" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "parcels_code_key" ON "parcels"("code");

-- CreateIndex
CREATE INDEX "parcels_userId_idx" ON "parcels"("userId");

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
CREATE INDEX "pickups_code_idx" ON "pickups"("code");

-- CreateIndex
CREATE INDEX "pickups_dateDemande_idx" ON "pickups"("dateDemande");

-- CreateIndex
CREATE INDEX "tickets_userId_idx" ON "tickets"("userId");

-- CreateIndex
CREATE INDEX "tickets_statut_idx" ON "tickets"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_numero_key" ON "invoices"("numero");

-- CreateIndex
CREATE INDEX "invoices_userId_idx" ON "invoices"("userId");

-- CreateIndex
CREATE INDEX "invoices_numero_idx" ON "invoices"("numero");

-- CreateIndex
CREATE INDEX "returns_userId_idx" ON "returns"("userId");

-- CreateIndex
CREATE INDEX "returns_numeroColis_idx" ON "returns"("numeroColis");

-- CreateIndex
CREATE INDEX "inventory_userId_idx" ON "inventory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_email_key" ON "team_members"("email");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- CreateIndex
CREATE INDEX "messages_userId_idx" ON "messages"("userId");

-- CreateIndex
CREATE INDEX "messages_lu_idx" ON "messages"("lu");
