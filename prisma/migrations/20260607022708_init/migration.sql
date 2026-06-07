-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "mk_auth_address" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "activated_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_logs" (
    "id" TEXT NOT NULL,
    "mk_auth_address" TEXT NOT NULL,
    "result" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "validated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "licenses_mk_auth_address_key" ON "licenses"("mk_auth_address");

-- CreateIndex
CREATE INDEX "licenses_mk_auth_address_idx" ON "licenses"("mk_auth_address");

-- CreateIndex
CREATE INDEX "validation_logs_mk_auth_address_idx" ON "validation_logs"("mk_auth_address");

-- CreateIndex
CREATE INDEX "validation_logs_validated_at_idx" ON "validation_logs"("validated_at");

-- AddForeignKey
ALTER TABLE "validation_logs" ADD CONSTRAINT "validation_logs_mk_auth_address_fkey" FOREIGN KEY ("mk_auth_address") REFERENCES "licenses"("mk_auth_address") ON DELETE RESTRICT ON UPDATE CASCADE;
