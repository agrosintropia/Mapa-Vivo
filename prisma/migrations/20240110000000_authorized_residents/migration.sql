-- CreateTable
CREATE TABLE "AuthorizedResident" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthorizedResident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthorizedResident_project_id_email_key" ON "AuthorizedResident"("project_id", "email");

-- AddForeignKey
ALTER TABLE "AuthorizedResident" ADD CONSTRAINT "AuthorizedResident_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
