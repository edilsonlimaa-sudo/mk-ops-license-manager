-- AlterTable
ALTER TABLE "licenses" ADD COLUMN     "address" TEXT,
ADD COLUMN     "billing_day" INTEGER,
ADD COLUMN     "billing_email" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "monthly_value" DECIMAL(10,2),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE INDEX "licenses_status_idx" ON "licenses"("status");

-- CreateIndex
CREATE INDEX "licenses_expires_at_idx" ON "licenses"("expires_at");
