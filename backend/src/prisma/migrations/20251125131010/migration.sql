-- Add pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_service" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" TEXT NOT NULL,
    "service_config" JSONB,
    "errored" BOOLEAN NOT NULL DEFAULT false,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_action" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action_name" TEXT NOT NULL,
    "area_id" UUID NOT NULL,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_reaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reaction_name" TEXT NOT NULL,
    "area_id" UUID NOT NULL,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_link" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider_name" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "user_service" ADD CONSTRAINT "user_service_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area" ADD CONSTRAINT "area_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_action" ADD CONSTRAINT "area_action_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_reaction" ADD CONSTRAINT "area_reaction_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_link" ADD CONSTRAINT "oauth_link_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
