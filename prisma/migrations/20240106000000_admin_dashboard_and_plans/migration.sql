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
    (gen_random_uuid(), 'basico', 'Básico', 299.00, 200, 2, ARRAY['Mapeamento de árvores', 'QR codes', 'Painel do gestor', 'Relatório básico']),
    (gen_random_uuid(), 'profissional', 'Profissional', 599.00, 1000, 6, ARRAY['Tudo do Básico', 'Sub-áreas ilimitadas', 'Relatório completo de diversidade', 'Observações de moradores', 'Exportação CSV']),
    (gen_random_uuid(), 'enterprise', 'Enterprise', 1299.00, NULL, NULL, ARRAY['Tudo do Profissional', 'Árvores ilimitadas', 'Visitas ilimitadas', 'API de integração', 'Suporte prioritário', 'Relatório personalizado']);
