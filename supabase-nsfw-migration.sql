-- NSFW Feature Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Add is_nsfw column to slangs table
ALTER TABLE slangs ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN NOT NULL DEFAULT false;

-- 2. Add show_nsfw column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_nsfw BOOLEAN NOT NULL DEFAULT false;

-- 3. Index for filtering NSFW content
CREATE INDEX IF NOT EXISTS idx_slangs_is_nsfw ON slangs(is_nsfw);
