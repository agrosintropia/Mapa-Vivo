-- Phase 1: Schema changes for restructuring

-- Tree: additional photo URLs
ALTER TABLE "Tree" ADD COLUMN "photo_url_2" TEXT;
ALTER TABLE "Tree" ADD COLUMN "photo_url_3" TEXT;

-- Project: plan expiration
ALTER TABLE "Project" ADD COLUMN "plan_expires_at" TIMESTAMP(3);

-- ServiceRequest: technical service requests from gestors
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "assigned_technician_id" TEXT,
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update plan limits to correct values
UPDATE "Plan" SET "tree_limit" = 200, "visit_limit" = 0 WHERE "name" = 'basico';
UPDATE "Plan" SET "tree_limit" = 500, "visit_limit" = 1 WHERE "name" = 'standard';
UPDATE "Plan" SET "tree_limit" = 1500, "visit_limit" = 2 WHERE "name" = 'premium';
