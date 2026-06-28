-- CreateTable
CREATE TABLE "TechnicalVisit" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "technician_id" TEXT NOT NULL,
    "technician_name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'em_andamento',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "TechnicalVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitAction" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "summary" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TechnicalVisit" ADD CONSTRAINT "TechnicalVisit_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitAction" ADD CONSTRAINT "VisitAction_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "TechnicalVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
