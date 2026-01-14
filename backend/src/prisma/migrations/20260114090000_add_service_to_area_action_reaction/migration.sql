-- Add service column to area_action and area_reaction
ALTER TABLE "area_action" ADD COLUMN service TEXT NOT NULL DEFAULT '';
ALTER TABLE "area_reaction" ADD COLUMN service TEXT NOT NULL DEFAULT '';
