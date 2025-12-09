/*
  Migration: add auth platform to users.
  NOTE: area_action / area_reaction columns (config -> cache/params)
  were already applied in an earlier migration (20251202092722). To
  avoid re-applying those changes and causing errors during a fresh
  migrate run, this migration contains only the user table alteration.
*/

-- AlterTable: add auth fields to users
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "auth_id" TEXT,
  ADD COLUMN IF NOT EXISTS "auth_platform" TEXT NOT NULL DEFAULT 'local';
