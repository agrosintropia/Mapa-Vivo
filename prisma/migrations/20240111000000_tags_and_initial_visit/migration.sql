-- Tree: tag tracking
ALTER TABLE "Tree" ADD COLUMN "tag_installed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tree" ADD COLUMN "tag_installed_at" TIMESTAMP(3);

-- Project: initial visit and tag pricing
ALTER TABLE "Project" ADD COLUMN "initial_visit_completed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "tag_unit_price" DOUBLE PRECISION;
ALTER TABLE "Project" ADD COLUMN "tag_margin" DOUBLE PRECISION NOT NULL DEFAULT 0.30;

-- Set default tag price for MVP (R$ 3.90)
UPDATE "Project" SET "tag_unit_price" = 3.90;
