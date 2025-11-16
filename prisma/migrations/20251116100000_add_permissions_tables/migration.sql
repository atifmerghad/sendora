-- CreateTable: Permission
CREATE TABLE IF NOT EXISTS "permissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default permissions
INSERT OR IGNORE INTO "permissions" ("name", "description", "createdAt", "updatedAt") VALUES
    ('dashboard', 'Accès au tableau de bord', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('gestionColis', 'Gestion des colis', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('gestionRamassages', 'Gestion des ramassages', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('gestionStock', 'Gestion du stock', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('gestionRetours', 'Gestion des retours', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('gestionFactures', 'Gestion des factures', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('chat', 'Accès au chat', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('mesTickets', 'Gestion des tickets', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CreateTable: UserPermission (join table)
CREATE TABLE IF NOT EXISTS "user_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("userId", "permissionId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "user_permissions_userId_idx" ON "user_permissions"("userId");
CREATE INDEX IF NOT EXISTS "user_permissions_permissionId_idx" ON "user_permissions"("permissionId");

-- Migrate existing permissions from users.permissions (String) to user_permissions table
-- This assumes permissions were stored as JSON or comma-separated strings
-- For JSON format like: {"dashboard":true,"gestionColis":true}
-- For CSV format like: "dashboard,gestionColis"

-- First, create a temporary table to hold user permissions
CREATE TEMP TABLE temp_user_permissions AS
SELECT 
    u.id as userId,
    p.id as permissionId
FROM users u
CROSS JOIN permissions p
WHERE 
    -- Check if permissions string contains the permission name (JSON format)
    (u.permissions LIKE '%"' || p.name || '"%' AND u.permissions LIKE '%:true%')
    OR
    -- Check if permissions string contains the permission name (CSV format)
    (',' || u.permissions || ',' LIKE '%,' || p.name || ',%')
    AND u.permissions IS NOT NULL
    AND u.permissions != '';

-- Insert into user_permissions if not exists
INSERT OR IGNORE INTO "user_permissions" ("id", "userId", "permissionId", "createdAt")
SELECT 
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))) as id,
    userId,
    permissionId,
    CURRENT_TIMESTAMP
FROM temp_user_permissions;

-- Drop temporary table
DROP TABLE IF EXISTS temp_user_permissions;

-- Note: Removing the 'permissions' column from 'users' table requires recreating the table in SQLite
-- This is handled separately or via Prisma migrate. For now, we leave the column but it can be removed manually
-- The application code should now use user_permissions table instead of users.permissions

