-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_service" (
    "id" UUID NOT NULL,
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
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_action" (
    "id" UUID NOT NULL,
    "action_name" TEXT NOT NULL,
    "area_id" UUID NOT NULL,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "area_reaction" (
    "id" UUID NOT NULL,
    "reaction_name" TEXT NOT NULL,
    "area_id" UUID NOT NULL,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_link" (
    "id" UUID NOT NULL,
    "provider_name" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_created_at_idx" ON "user"("created_at");

-- CreateIndex
CREATE INDEX "user_service_user_id_idx" ON "user_service"("user_id");

-- CreateIndex
CREATE INDEX "user_service_service_id_idx" ON "user_service"("service_id");

-- CreateIndex
CREATE INDEX "user_service_errored_idx" ON "user_service"("errored");

-- CreateIndex
CREATE UNIQUE INDEX "user_service_user_id_service_id_key" ON "user_service"("user_id", "service_id");

-- CreateIndex
CREATE INDEX "area_user_id_idx" ON "area"("user_id");

-- CreateIndex
CREATE INDEX "area_created_at_idx" ON "area"("created_at");

-- CreateIndex
CREATE INDEX "area_action_area_id_idx" ON "area_action"("area_id");

-- CreateIndex
CREATE INDEX "area_action_action_name_idx" ON "area_action"("action_name");

-- CreateIndex
CREATE INDEX "area_reaction_area_id_idx" ON "area_reaction"("area_id");

-- CreateIndex
CREATE INDEX "area_reaction_reaction_name_idx" ON "area_reaction"("reaction_name");

-- CreateIndex
CREATE INDEX "oauth_link_user_id_idx" ON "oauth_link"("user_id");

-- CreateIndex
CREATE INDEX "oauth_link_provider_name_idx" ON "oauth_link"("provider_name");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_link_provider_name_provider_user_id_key" ON "oauth_link"("provider_name", "provider_user_id");

-- AddForeignKey
ALTER TABLE "user_service" ADD CONSTRAINT "user_service_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area" ADD CONSTRAINT "area_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_action" ADD CONSTRAINT "area_action_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area_reaction" ADD CONSTRAINT "area_reaction_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_link" ADD CONSTRAINT "oauth_link_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
