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

## Fase 3 — Dashboard ambiental (concluída)

**Status:** Completo
**Commit:** `feat: dashboard ambiental`

### O que foi feito

#### Dashboard `/[projectSlug]/dashboard`
- [x] Cartões resumo: indivíduos, espécies, % nativas, espécies ameaçadas (com ícones emoji)
- [x] Carbono estocado estimado (biomassa, carbono, CO₂eq) com metodologia expansível
- [x] Equação alométrica: biomassa = fator × DAP² × altura / 1000, carbono × 0.47, CO₂eq × 3.67
- [x] Fator de carbono específico por espécie (`default_carbon_factor`)
- [x] Exclusão automática de árvores sem DAP ou altura, com contagem exibida
- [x] Gráfico pizza: distribuição por estrato (Emergente, Alto, Médio, Baixo, Arbustivo)
- [x] Gráfico donut: distribuição por estado (Viva, Doente, Em tratamento, Morta, Removida)
- [x] Gráfico barras horizontal: distribuição por subclasse (usando labels de `lib/subclasses.ts`)
- [x] Bloco informativo "Sobre o bioma Cerrado"
- [x] Recharts com import dinâmico (`ssr: false`)
- [x] SEO: generateMetadata com nome do projeto
- [x] Tratamento de erro quando DB não disponível

### Como testar manualmente
1. Acesse `http://localhost:3000/mata-viva/dashboard`
2. Verifique os 4 cartões resumo com valores e ícones
3. Verifique a seção de carbono com 3 valores e botão "Ver metodologia"
4. Verifique os 3 gráficos: pizza (estrato), donut (estado), barras (subclasse)
5. Verifique o bloco sobre o Cerrado no final

---

## Fase 4 — Painel do gestor + validação (concluída)

**Status:** Completo
**Commit:** `feat: painel do gestor, submissões e validação`

### O que foi feito

#### Autenticação (NextAuth v5 + Google OAuth)
- [x] NextAuth v5 (beta) com PrismaAdapter e Google provider
- [x] Modelos Prisma: User, Account, Session, VerificationToken
- [x] Profile vinculado ao User com role (morador/gestor/tecnico)
- [x] Session callback injeta role e projectId no token
- [x] Página `/login` com botão Google (SVG) e mensagem de acesso restrito
- [x] Middleware protege rotas `/[projectSlug]/painel/*` via cookie check
- [x] `.env.example` atualizado com variáveis Google OAuth e AUTH_SECRET

#### Painel do gestor `/[projectSlug]/painel`
- [x] Verificação de role (apenas gestor/tecnico) com tela de acesso restrito
- [x] Cartões resumo: total árvores, validadas, pendentes, submissões
- [x] Aba "Árvores": tabela com busca, filtro por estado e confiabilidade
- [x] Aba "Submissões": lista recente com badge de status e link para fila
- [x] Indicador visual de submissões pendentes (pulse dot + badge)
- [x] Header com navegação (mapa, dashboard) e badge de role

#### Formulário de submissão `/[projectSlug]/submeter`
- [x] Formulário público (sem login) para reportar ocorrências
- [x] Campos: nome, espécie (opcional), coordenadas, observações
- [x] Botão "Usar minha localização atual" via Geolocation API
- [x] Dropdown de espécies com nome comum e científico
- [x] Validação client-side e server-side
- [x] Tela de sucesso com opções de nova submissão ou ver mapa

#### Fila de aprovação `/[projectSlug]/painel/submissoes`
- [x] Lista de submissões com filtros por status (pendente/aprovada/rejeitada/mais_info)
- [x] Card expandido com dados: autor, data, espécie sugerida, coordenadas, notas
- [x] Ações de revisão: Aprovar, Rejeitar, Pedir mais info
- [x] Atualização otimista (sem reload) após revisão
- [x] Contador de pendentes com destaque visual

#### API Routes
- [x] `POST /api/projects/[slug]/submissions` — criar submissão (validação de input)
- [x] `PATCH /api/submissions/[id]/review` — revisar submissão (autenticado, role check)
- [x] `PATCH /api/trees/[id]/validate` — alterar selo de confiabilidade (apenas técnico)
- [x] Validação de coordenadas (range -90/90, -180/180)
- [x] Evento de validação registrado automaticamente na timeline da árvore

### Como testar manualmente
1. Configure Google OAuth credentials no `.env`
2. Acesse `http://localhost:3000/login` e faça login com Google
3. Crie um Profile vinculado ao seu User.id com role "tecnico" no banco
4. Acesse `http://localhost:3000/mata-viva/painel` — painel com árvores e submissões
5. Em outra aba, acesse `http://localhost:3000/mata-viva/submeter` e envie uma ocorrência
6. Volte ao painel → aba Submissões → clique "Abrir fila de revisão"
7. Aprove ou rejeite a submissão

---

## Fase 5 — A ser implementada

### Polimento, PWA e deploy
- [ ] Polimento visual e responsividade
- [ ] PWA manifest + service worker
- [ ] Landing page
- [ ] README atualizado
- [ ] Deploy (Railway/Vercel)

---

## Notas técnicas

- **Banco de dados:** PostgreSQL (local: `localhost:5432/mapavivo`)
- **Para rodar o seed:** `npx prisma db seed` (requer banco ativo)
- **Para gerar o client Prisma:** `npx prisma generate`
- **Para criar as tabelas:** `npx prisma migrate dev --name init`
