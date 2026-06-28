-- AlterTable TechnicalVisit: billing fields
ALTER TABLE "TechnicalVisit" ADD COLUMN "base_fee" DOUBLE PRECISION NOT NULL DEFAULT 1800;
ALTER TABLE "TechnicalVisit" ADD COLUMN "travel_cost" DOUBLE PRECISION;
ALTER TABLE "TechnicalVisit" ADD COLUMN "total_billed" DOUBLE PRECISION;
ALTER TABLE "TechnicalVisit" ADD COLUMN "billing_paid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable ReviewRequest: billing fields
ALTER TABLE "ReviewRequest" ADD COLUMN "tree_count" INTEGER;
ALTER TABLE "ReviewRequest" ADD COLUMN "review_fee" DOUBLE PRECISION;
ALTER TABLE "ReviewRequest" ADD COLUMN "billing_paid" BOOLEAN NOT NULL DEFAULT false;
