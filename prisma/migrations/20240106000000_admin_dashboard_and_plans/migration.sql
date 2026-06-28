-- CreateTable Plan
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "monthly_price" DOUBLE PRECISION NOT NULL,
    "tree_limit" INTEGER,
    "visit_limit" INTEGER,
    "features" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- AlterTable Project
ALTER TABLE "Project" ADD COLUMN "plan_id" TEXT;
ALTER TABLE "Project" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ativo';

ALTER TABLE "Project" ADD CONSTRAINT "Project_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default plans
INSERT INTO "Plan" ("id", "name", "display_name", "monthly_price", "tree_limit", "visit_limit", "features")
VALUES
    (gen_random_uuid(), 'basico', 'Básico', 479.00, 200, 0, ARRAY['Mapeamento de árvores', 'QR codes', 'Painel do gestor', 'Relatório básico', 'Observações de moradores']),
    (gen_random_uuid(), 'standard', 'Standard', 679.00, 1000, 1, ARRAY['Tudo do Básico', 'Sub-áreas ilimitadas', 'Relatório completo de diversidade', 'Exportação CSV', '1 visita técnica/ano (sem deslocamento)']),
    (gen_random_uuid(), 'premium', 'Premium', 1379.00, 5000, 2, ARRAY['Tudo do Standard', 'Até 5.000 árvores', 'API de integração', '2 visitas técnicas/ano (sem deslocamento)', 'Suporte prioritário', 'Relatório personalizado']);
