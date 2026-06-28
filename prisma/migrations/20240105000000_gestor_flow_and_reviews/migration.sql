-- AlterTable Project
ALTER TABLE "Project" ADD COLUMN "invite_code" TEXT;
ALTER TABLE "Project" ADD COLUMN "gestor_email" TEXT;
CREATE UNIQUE INDEX "Project_invite_code_key" ON "Project"("invite_code");

-- AlterTable Species
ALTER TABLE "Species" ADD COLUMN "added_by" TEXT;
ALTER TABLE "Species" ADD COLUMN "validation_status" TEXT NOT NULL DEFAULT 'validada';

-- CreateTable ProjectMember
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectMember_project_id_user_id_key" ON "ProjectMember"("project_id", "user_id");

ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable ReviewRequest
CREATE TABLE "ReviewRequest" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ReviewRequest" ADD CONSTRAINT "ReviewRequest_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
