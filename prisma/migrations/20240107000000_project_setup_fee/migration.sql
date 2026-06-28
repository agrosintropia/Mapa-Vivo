-- AlterTable Project: setup fee
ALTER TABLE "Project" ADD COLUMN "setup_fee" DOUBLE PRECISION;
ALTER TABLE "Project" ADD COLUMN "setup_installments" INTEGER;
ALTER TABLE "Project" ADD COLUMN "setup_payment" TEXT;
ALTER TABLE "Project" ADD COLUMN "setup_paid" BOOLEAN NOT NULL DEFAULT false;
