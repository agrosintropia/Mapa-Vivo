# 🌳 Mapa Vivo

**Plataforma SaaS de gestão de áreas verdes em condomínios, parques e incorporadoras.**

Desenvolvido por [Agrosintropia](mailto:agrosintropia@gmail.com) — Goiânia, GO.

---

## Funcionalidades

- **Mapa interativo** — Leaflet com marcadores por espécie, filtros por subclasse e busca
- **Ficha da árvore** — Página pública acessível via QR code com dados ecológicos e timeline de eventos
- **QR Codes** — Geração individual e impressão em lote para identificação em campo
- **Dashboard ambiental** — Carbono estocado, distribuição por estrato/status/subclasse (Recharts)
- **Painel do gestor** — Tabela de árvores com filtros, submissões e fila de aprovação
- **Submissão pública** — Moradores reportam ocorrências com geolocalização
- **Validação técnica** — Selo de confiabilidade com revisão por técnicos
- **Autenticação** — NextAuth v5 com Google OAuth e controle por role

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v3 |
| Mapa | React Leaflet + Leaflet.js |
| Gráficos | Recharts |
| ORM | Prisma + PostgreSQL |
| Auth | NextAuth v5 + @auth/prisma-adapter |
| QR Code | qrcode |
| PWA | manifest.json + theme-color |

## Setup local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais de DB e Google OAuth

# 3. Gerar client Prisma
npx prisma generate

# 4. Criar tabelas
npx prisma migrate dev --name init

# 5. Popular com dados de demonstração
npx prisma db seed

# 6. Rodar dev server
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Projeto piloto

**Residencial Mata Viva** — Goiânia, GO, Bioma Cerrado

- 20 espécies nativas catalogadas
- ~125 árvores georreferenciadas
- 2,4 hectares de área verde

### Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/mata-viva/mapa` | Mapa interativo |
| `/mata-viva/dashboard` | Dashboard ambiental |
| `/arvore/mv-001` | Ficha da árvore (QR) |
| `/mata-viva/submeter` | Formulário de ocorrência |
| `/mata-viva/painel` | Painel do gestor (autenticado) |
| `/admin/qrcodes` | Geração de QR codes |
| `/login` | Login com Google |

## Deploy

### Variáveis de ambiente necessárias

```
DATABASE_URL=postgresql://...
AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=https://seu-dominio.com
```

### Vercel

```bash
npm i -g vercel
vercel
```

### Railway

1. Crie um projeto no [Railway](https://railway.app)
2. Adicione um serviço PostgreSQL
3. Conecte o repositório GitHub
4. Configure as variáveis de ambiente
5. Build command: `npx prisma generate && npm run build`
6. Start command: `npm start`

## Licença

Proprietário — Agrosintropia © 2024–2025
