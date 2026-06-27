# Mapa Vivo — Progresso de Desenvolvimento

## Fase 0 — Fundação (concluída)

**Status:** Completo  
**Commit:** `feat: fundação + seed de demonstração`  
**Data:** 2024-06

### O que foi feito

#### Infraestrutura
- [x] Projeto Next.js 14 (App Router, TypeScript, Tailwind CSS)
- [x] Schema Prisma com PostgreSQL — 6 modelos completos
- [x] Variáveis de ambiente configuradas (`.env`, `.env.example`)
- [x] Configuração de Tailwind com paleta de cores do cerrado
- [x] TypeScript configurado com alias `@/*`

#### Modelos de dados
- [x] `Project` — projetos (condomínios, parques, incorporadoras)
- [x] `Species` — catálogo de espécies com dados ecológicos
- [x] `Tree` — inventário arbóreo com QR slug único
- [x] `TreeEvent` — histórico de eventos por árvore
- [x] `Submission` — submissões de moradores
- [x] `Profile` — perfis de usuários (morador, gestor, técnico)

#### Seed de demonstração
- [x] **Projeto piloto:** Residencial Mata Viva — Goiânia, GO
- [x] **20 espécies** nativas do Cerrado e Mata Atlântica com dados ecológicos reais
- [x] **125 árvores** distribuídas na área do projeto com coordenadas coerentes
- [x] **~350 eventos** de árvore (plantio, poda, validação, etc.)
- [x] **4 submissões pendentes** de moradores
- [x] **3 perfis** de usuários

#### Bibliotecas instaladas
- [x] `prisma` + `@prisma/client`
- [x] `next-auth@beta` + `@auth/prisma-adapter`
- [x] `react-leaflet@4` + `leaflet` (mapa interativo)
- [x] `recharts` (gráficos)
- [x] `qrcode` (geração de QR codes)
- [x] `uuid` (geração de IDs)
- [x] `ts-node` (execução do seed)

#### Utilitários
- [x] `lib/subclasses.ts` — lista canônica de subclasses de espécies

---

## Fase 1 — A ser implementada

### Mapa Interativo (Leaflet)
- [ ] Página `/mapa/[slug]` com mapa das árvores do projeto
- [ ] Marcadores coloridos por status
- [ ] Popup com informações básicas e link para ficha completa
- [ ] Filtros por espécie, status, subclasse

### Ficha da Árvore
- [ ] Página `/arvore/[qr_slug]` — acessível via QR code
- [ ] Exibe espécie, dados dendrométricos, histórico de eventos
- [ ] Galeria de fotos

### Painel do Gestor
- [ ] Listagem de árvores com filtros
- [ ] Aprovação de submissões
- [ ] Geração de QR codes (PDF)
- [ ] Relatório resumido

### Dashboard
- [ ] Gráficos de diversidade de espécies
- [ ] Contagem por status
- [ ] Estimativa de carbono sequestrado

### Autenticação
- [ ] Login com NextAuth (e-mail magic link ou OAuth)
- [ ] Controle de acesso por role

---

## Notas técnicas

- **Banco de dados:** PostgreSQL (local: `localhost:5432/mapavivo`)
- **Para rodar o seed:** `npx prisma db seed` (requer banco ativo)
- **Para gerar o client Prisma:** `npx prisma generate`
- **Para criar as tabelas:** `npx prisma migrate dev --name init`
