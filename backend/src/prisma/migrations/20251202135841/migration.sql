/*
  Warnings:

  - You are about to drop the column `service_id` on the `user_service` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,service_name]` on the table `user_service` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `service_name` to the `user_service` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_service_service_id_idx";

-- DropIndex
DROP INDEX "user_service_user_id_service_id_key";

-- AlterTable
ALTER TABLE "user_service" DROP COLUMN "service_id",
ADD COLUMN     "service_name" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "user_service_service_name_idx" ON "user_service"("service_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_service_user_id_service_name_key" ON "user_service"("user_id", "service_name");
