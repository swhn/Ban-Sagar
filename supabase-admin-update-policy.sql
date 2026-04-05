-- Run this in Supabase SQL Editor
-- Allows admins to read and update ALL user profiles (for role management)

-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Users can read own profile or mods can read all" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Re-create with admin privileges
CREATE POLICY "Users can read own profile or mods can read all"
  ON users FOR SELECT
  USING (id = auth.uid() OR is_moderator_or_admin(auth.uid()));

CREATE POLICY "Users or admins can update profiles"
  ON users FOR UPDATE
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
