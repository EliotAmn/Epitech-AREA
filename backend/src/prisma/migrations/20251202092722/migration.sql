/*
  Warnings:

  - You are about to drop the column `config` on the `area_action` table. All the data in the column will be lost.
  - You are about to drop the column `config` on the `area_reaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "area_action" DROP COLUMN "config",
ADD COLUMN     "cache" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "params" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "area_reaction" DROP COLUMN "config",
ADD COLUMN     "cache" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "params" JSONB NOT NULL DEFAULT '{}';
