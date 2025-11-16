-- Fix all users to have ACTIVE account state (id=1)
-- This ensures all existing users have a valid accountStateId

-- Update all users with NULL, 0, or invalid accountStateId to ACTIVE (id=1)
UPDATE users 
SET accountStateId = 1 
WHERE accountStateId IS NULL 
   OR accountStateId = 0 
   OR accountStateId NOT IN (SELECT id FROM account_states);

-- Verify: Check that all users now have a valid accountStateId
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN accountStateId = 1 THEN 1 END) as active_users,
    COUNT(CASE WHEN accountStateId = 2 THEN 1 END) as inactive_users,
    COUNT(CASE WHEN accountStateId = 3 THEN 1 END) as suspended_users
FROM users;

