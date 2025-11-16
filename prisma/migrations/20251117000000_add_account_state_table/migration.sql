-- CreateTable: AccountState
CREATE TABLE IF NOT EXISTS "account_states" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL UNIQUE,
    "code" TEXT NOT NULL UNIQUE,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default account states
INSERT OR IGNORE INTO "account_states" ("name", "code", "createdAt", "updatedAt") VALUES
    ('Active', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Inactive', 'INACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Suspended', 'SUSPENDED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add accountStateId column to users table
-- First, get the ACTIVE state ID (should be 1)
-- Create a temporary table for users with the new column
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "deuxiemeTelephone" TEXT,
    "adresse" TEXT,
    "accountStateId" INTEGER NOT NULL DEFAULT 1,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    "imageProfil" TEXT,
    "businessId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "users_accountStateId_fkey" FOREIGN KEY ("accountStateId") REFERENCES "account_states" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "users_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data from old users table to new_users
-- Map old etat values to accountStateId
-- Active -> 1 (ACTIVE), Inactive -> 2 (INACTIVE), Suspendu -> 3 (SUSPENDED), NULL or other -> 1 (ACTIVE)
INSERT INTO "new_users" (
    "id", "nom", "prenom", "email", "password", "telephone", "deuxiemeTelephone", 
    "adresse", "accountStateId", "roleId", "imageProfil", "businessId", "createdAt"
)
SELECT 
    "id", "nom", "prenom", "email", "password", "telephone", "deuxiemeTelephone",
    "adresse",
    CASE 
        WHEN "etat" = 'Active' THEN 1
        WHEN "etat" = 'Inactive' THEN 2
        WHEN "etat" = 'Suspendu' THEN 3
        ELSE 1
    END as "accountStateId",
    "roleId", "imageProfil", "businessId", "createdAt"
FROM "users";

-- Drop the old users table
DROP TABLE "users";

-- Rename new_users to users
ALTER TABLE "new_users" RENAME TO "users";

-- Recreate indexes
CREATE INDEX IF NOT EXISTS "users_roleId_idx" ON "users"("roleId");
CREATE INDEX IF NOT EXISTS "users_businessId_idx" ON "users"("businessId");
CREATE INDEX IF NOT EXISTS "users_accountStateId_idx" ON "users"("accountStateId");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

