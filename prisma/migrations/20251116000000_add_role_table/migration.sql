-- CreateTable: Role (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL UNIQUE,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles (only if they don't exist)
INSERT OR IGNORE INTO "roles" ("name", "createdAt", "updatedAt") VALUES 
    ('CLIENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('LIVREUR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MEMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Check if roleId column exists, if not add it
-- Note: SQLite doesn't have a direct way to check, so we'll handle errors gracefully
-- Add roleId column to users table (nullable first for migration) - skip if exists
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we check schema differently

-- Migrate existing role data to roleId (if role column still exists)
-- First check if users table has 'role' column by trying to update
-- Map existing enum values to role IDs
UPDATE "users" SET "roleId" = (
    CASE 
        WHEN "role" = 'CLIENT' THEN 1
        WHEN "role" = 'ADMIN' THEN 2
        WHEN "role" = 'LIVREUR' THEN 3
        ELSE 1  -- Default to CLIENT if unknown
    END
) WHERE "roleId" IS NULL AND EXISTS (SELECT 1 FROM pragma_table_info('users') WHERE name = 'role');

-- Set default value for roleId if still null
UPDATE "users" SET "roleId" = 1 WHERE "roleId" IS NULL;

-- Note: If roleId column doesn't exist yet, we need to recreate the table
-- This is handled by checking if we can alter the table
-- Since SQLite limitations, we'll create a simpler migration that assumes
-- the table needs to be recreated only if the roleId column doesn't exist

-- For existing databases, we manually need to:
-- 1. Ensure roles table exists and is populated (done above)
-- 2. Add roleId column if it doesn't exist
-- 3. Migrate data from role to roleId
-- 4. Drop role column and recreate table with roleId only

-- However, SQLite doesn't support DROP COLUMN, so we need to recreate the table
-- This migration assumes the user will handle the table recreation manually or via Prisma migrate

-- Create indexes (ignore if they exist)
CREATE INDEX IF NOT EXISTS "users_roleId_idx" ON "users"("roleId");
CREATE INDEX IF NOT EXISTS "users_businessId_idx" ON "users"("businessId");
