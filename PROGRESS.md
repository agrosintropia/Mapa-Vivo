# Mapa Vivo — Progresso de Desenvolvimento

## Fase 0 — Fundação (concluída)

**Status:** Completo
**Commit:** `feat: fundação + seed de demonstração`

### O que foi feito

#### Infraestrutura
- [x] Projeto Next.js 14 (App Router, TypeScript, Tailwind CSS v3)
- [x] Schema Prisma com PostgreSQL — 6 modelos completos
- [x] Variáveis de ambiente configuradas (`.env`, `.env.example`)
- [x] Configuração de Tailwind com paleta de cores do cerrado
- [x] TypeScript configurado com alias `@/*`
- [x] Fontes Fraunces (display) + Source Sans 3 via next/font

#### Seed de demonstração
- [x] **Projeto piloto:** Residencial Mata Viva — Goiânia, GO
- [x] **20 espécies** nativas do Cerrado e Mata Atlântica
- [x] **125 árvores** distribuídas na área do projeto
- [x] **~350 eventos** de árvore + **4 submissões pendentes**

---

## Fase 1 — Mapa público interativo (concluída)

**Status:** Completo
**Commit:** `feat: mapa público com busca por espécie e subclasse`

### O que foi feito

#### Mapa Interativo (Leaflet)
- [x] Página `/[projectSlug]/mapa` com mapa Leaflet centralizado no condomínio
- [x] CircleMarkers coloridos por espécie (paleta de 14 cores distintas)
- [x] Popup ao clicar: nome comum, científico, status, DAP, altura, link para ficha
- [x] Import dinâmico do Leaflet (ssr: false) — evita problemas com SSR
- [x] Loading spinner enquanto o mapa carrega

#### Filtros
- [x] **Por espécie** — busca com input de texto, case/accent-insensitive, dropdown com contagem
- [x] **Por subclasse** — chips clicáveis com scroll horizontal, multi-seleção
- [x] Contador de resultados: "X árvores encontradas" / "Mostrando todas as Y árvores"
- [x] Botão "Limpar filtros" quando filtros ativos
- [x] Tabs para alternar entre modo espécie e subclasse

#### Legenda
- [x] Painel colapsável no canto inferior esquerdo
- [x] Mostra espécies visíveis com cor, nome e contagem
- [x] Colapsável no mobile, sempre visível em desktop

#### Infraestrutura
- [x] `lib/prisma.ts` — singleton lazy do Prisma (Proxy para evitar crash sem DB no build)
- [x] `lib/types.ts` — tipos compartilhados (ProjectData, TreeData, SpeciesData)
- [x] API route GET `/api/projects/[slug]/trees`
- [x] Tratamento de erro quando DB não disponível

### Como testar manualmente
1. Com Postgres rodando e seed populado, acesse `http://localhost:3000/mata-viva/mapa`
2. O mapa deve mostrar ~125 marcadores coloridos centrados em Goiânia
3. Teste filtro por espécie: digite "ipê" e selecione "Ipê-amarelo" — só os ipês devem aparecer
4. Teste filtro por subclasse: clique em "Ameaçada" — devem aparecer Aroeira e Pau-brasil
5. Verifique que o popup mostra dados corretos e o link "Ver ficha" aponta para `/arvore/mv-XXX`

---

## Fase 2 — A ser implementada

### Ficha da Árvore via QR
- [ ] Página pública `/arvore/[qr_slug]`
- [ ] Dados completos: foto, espécie, selos, timeline de eventos
- [ ] Geração e impressão de QR codes em lote

---

## Notas técnicas

- **Banco de dados:** PostgreSQL (local: `localhost:5432/mapavivo`)
- **Para rodar o seed:** `npx prisma db seed` (requer banco ativo)
- **Para gerar o client Prisma:** `npx prisma generate`
- **Para criar as tabelas:** `npx prisma migrate dev --name init`
