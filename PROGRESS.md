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

## Fase 2 — Ficha da árvore via QR (concluída)

**Status:** Completo
**Commit:** `feat: ficha pública da árvore + geração de QR`

### O que foi feito

#### Ficha pública `/arvore/[qr_slug]`
- [x] Página hero mobile-first com foto (ou placeholder SVG)
- [x] Nome comum (font-display, 3xl) + científico (italic) + família
- [x] Badges: status (colorido), estrato (com ícone), confiabilidade (selo)
- [x] Subclasses como selos/pills coloridos
- [x] Seção "Sobre esta espécie": descrição, função ecológica, frutificação, fauna
- [x] Seção "Medições": DAP, altura, data de plantio em cards
- [x] Timeline vertical de eventos com cores por tipo
- [x] Botão "Ver no mapa" vinculado ao projeto
- [x] Identificador QR slug no rodapé
- [x] SEO: generateMetadata com nome da espécie e projeto

#### Geração de QR Codes (`/admin/qrcodes`)
- [x] Lista de todas as árvores com nome, código, status
- [x] "Gerar QR" por árvore individual com preview e download
- [x] Impressão em lote: grid de tags com QR + dados da árvore
- [x] Print CSS: `window.print()`, tags não quebram entre páginas
- [x] QR aponta para URL pública `/arvore/[qr_slug]`
- [x] QR usa cor verde-cerrado (#2D5016)

### Como testar manualmente
1. Acesse `http://localhost:3000/arvore/mv-001` — ficha completa da árvore
2. Verifique foto placeholder, badges de status/estrato, selos de subclasse
3. Verifique timeline de eventos (data, tipo, descrição, autor)
4. Clique "Ver no mapa" — deve ir para `/mata-viva/mapa`
5. Acesse `http://localhost:3000/admin/qrcodes` — lista de árvores
6. Clique "Gerar QR" em uma árvore — QR aparece com download
7. Clique "Impressão em lote" → "Gerar todos" → "Imprimir tags"

---

## Fase 3 — A ser implementada

### Dashboard ambiental
- [ ] Cartões com totais (indivíduos, espécies, % nativas, ameaçadas)
- [ ] Carbono estocado estimado (com metodologia)
- [ ] Gráficos: distribuição por estrato, subclasse, status
- [ ] Bloco "Sobre o bioma Cerrado"

---

## Notas técnicas

- **Banco de dados:** PostgreSQL (local: `localhost:5432/mapavivo`)
- **Para rodar o seed:** `npx prisma db seed` (requer banco ativo)
- **Para gerar o client Prisma:** `npx prisma generate`
- **Para criar as tabelas:** `npx prisma migrate dev --name init`
