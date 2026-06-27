# Mapa Vivo — Especificação do Produto

**Versão:** 1.0 (Fase 0)  
**Empresa:** Agrosintropia  
**Produto:** Plataforma SaaS de gestão de áreas verdes em condomínios e parques urbanos  

---

## Visão Geral

Mapa Vivo é uma plataforma digital para inventário, gestão e comunicação de áreas verdes em condomínios residenciais, parques urbanos e projetos de incorporadoras. Cada árvore recebe uma identidade digital — com QR code, ficha técnica, histórico de manutenção e dados ecológicos — acessível tanto para gestores quanto para moradores.

---

## Problema a Resolver

Gestores de condomínios e parques urbanos carecem de ferramentas adequadas para:
1. **Inventariar** o patrimônio arbóreo com dados técnicos confiáveis
2. **Monitorar** o estado fitossanitário das árvores ao longo do tempo
3. **Comunicar** o valor ecológico das áreas verdes para moradores e stakeholders
4. **Cumprir** exigências legais de inventário e planos de manejo
5. **Engajar** moradores na preservação e valorização do verde

---

## Personas

### Gestor de Condomínio
- Síndico profissional ou administrador predial
- Precisa de relatórios para assembleias e prestação de contas
- Quer minimizar riscos (queda de árvores, processos judiciais)
- Necessita de laudos técnicos para poda e remoção

### Técnico Ambiental / Arborista
- Engenheiro agrônomo, florestal ou biólogo
- Realiza o inventário e laudos técnicos
- Precisa de ferramenta de campo (mobile) para coleta de dados
- Gera relatórios assinados digitalmente

### Morador
- Usuário final da área verde
- Quer saber o nome das árvores que vê todo dia
- Pode reportar problemas (galhos caídos, árvore doente)
- Engaja-se com gamificação (árvore apadrinhada, pontos verdes)

### Incorporadora
- Precisa demonstrar compromisso ambiental para clientes e licenças
- Quer relatório de carbono sequestrado como diferencial de marketing
- Documenta compensação ambiental exigida por órgãos licenciadores

---

## Funcionalidades por Fase

### Fase 0 — Fundação (atual)
- Setup do projeto Next.js 14
- Schema Prisma completo
- Seed com dados reais de demonstração
- Paleta de design (cores cerrado)
- Estrutura de bibliotecas

### Fase 1 — MVP Funcional
- Mapa interativo (Leaflet) com todas as árvores
- Ficha da árvore acessível via QR code
- Cadastro básico de árvores
- Histórico de eventos por árvore
- Painel do gestor (listagem, filtros)
- Submissão de ocorrências por moradores

### Fase 2 — Relatórios e Engajamento
- Dashboard com gráficos (Recharts)
- Relatório de diversidade de espécies
- Estimativa de carbono sequestrado
- Geração de QR codes em PDF
- Exportação de inventário (CSV/PDF)

### Fase 3 — Autenticação e Multi-tenancy
- Login com NextAuth (magic link + OAuth)
- Controle de acesso por role (morador/gestor/técnico)
- Multi-projeto por conta
- Planos de assinatura (Stripe)

### Fase 4 — App Mobile e Gamificação
- PWA com geolocalização para coleta em campo
- Reconhecimento de espécies por foto (IA)
- "Adote uma árvore" para moradores
- Notificações push de eventos

---

## Modelo de Dados

### Project
Representa um condomínio, parque ou projeto de incorporadora.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| name | String | Nome do projeto |
| slug | String | URL amigável única |
| type | String | condominio\|parque\|incorporadora |
| city | String | Cidade |
| state | String | Estado (UF) |
| biome | String | Bioma principal |
| area_hectares | Float? | Área total em hectares |
| boundary | JSON? | Polígono GeoJSON da área |

### Species
Catálogo de espécies arbóreas com dados ecológicos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| common_name | String | Nome popular |
| scientific_name | String | Nome científico |
| family | String | Família botânica |
| biome | String[] | Biomas de ocorrência |
| strata | String | emergente\|alto\|medio\|baixo\|arbustivo |
| description | String? | Descrição geral |
| ecological_function | String? | Função no ecossistema |
| fruiting_season | String? | Época de frutificação |
| fauna_attracted | String? | Fauna atraída |
| subclasses | String[] | Classificações especiais |
| default_carbon_factor | Float? | Fator de carbono padrão (tCO2/ano) |

### Tree
Árvore individual cadastrada em um projeto.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| project_id | String | Projeto relacionado |
| species_id | String | Espécie identificada |
| lat | Float | Latitude GPS |
| lng | Float | Longitude GPS |
| dbh_cm | Float? | Diâmetro à altura do peito (cm) |
| height_m | Float? | Altura estimada (m) |
| planted_date | DateTime? | Data de plantio |
| status | String | viva\|doente\|em_tratamento\|morta\|removida |
| reliability | String | validado_tecnico\|pendente\|declarado_gestor |
| photo_url | String? | Foto principal |
| qr_slug | String | Código único para QR code |

### TreeEvent
Histórico de eventos de manutenção e monitoramento.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| tree_id | String | Árvore relacionada |
| type | String | plantio\|atualizacao_estado\|poda\|validacao\|observacao |
| description | String? | Descrição detalhada |
| photo_url | String? | Foto do evento |
| author_role | String | gestor\|tecnico |

### Submission
Ocorrência reportada por morador.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| project_id | String | Projeto relacionado |
| submitted_by | String | Nome/ID do submissor |
| species_guess_id | String? | Sugestão de espécie |
| lat | Float | Latitude do local |
| lng | Float | Longitude do local |
| photo_url | String? | Foto da ocorrência |
| notes | String? | Observações |
| status | String | pendente\|aprovada\|rejeitada\|mais_info |
| reviewer_id | String? | ID do revisor |

### Profile
Perfil de usuário com papel no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Vinculado ao ID do usuário (NextAuth) |
| name | String | Nome completo |
| role | String | morador\|gestor\|tecnico |
| project_id | String? | Projeto vinculado |

---

## Subclasses de Espécies

| Chave | Rótulo | Descrição |
|-------|--------|-----------|
| nativa | Nativa | Espécie nativa do bioma |
| exotica | Exótica | Espécie introduzida |
| nativa_com_flor | Com flor | Floração ornamental marcante |
| frutifera | Frutífera | Produz frutos comestíveis |
| madeireira_nobre | Madeireira nobre | Madeira de alto valor |
| medicinal | Medicinal | Uso medicinal comprovado |
| ameacada_de_extincao | Ameaçada | Espécie em lista de ameaça |
| atrativa_de_fauna | Atrativa de fauna | Relevante para fauna local |
| melifera | Melífera | Recurso para abelhas |
| pioneira | Pioneira | Facilita regeneração natural |

---

## Design System

### Paleta de Cores (Cerrado)
- `verde-cerrado`: `#2D5016` — cor primária, fundos escuros
- `verde-medio`: `#4A7C2F` — cor secundária, botões, ações
- `terracota`: `#C4622D` — alertas, destaques
- `ocre`: `#D4A017` — badges, informações
- `areia`: `#F5F0E8` — fundo claro, backgrounds

### Tipografia
- Font: system-ui / sans-serif stack (web-safe)
- Títulos: bold, verde-cerrado
- Corpo: regular, gray-700

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Mapa | React Leaflet + Leaflet.js |
| Gráficos | Recharts |
| ORM | Prisma + PostgreSQL |
| Autenticação | NextAuth v5 (beta) + @auth/prisma-adapter |
| Upload | Cloudinary |
| QR Code | qrcode library |
| Deploy | Vercel (frontend) + Supabase/Neon (DB) |

---

## Projeto Piloto: Residencial Mata Viva

**Localização:** Goiânia, GO  
**Bioma:** Cerrado  
**Área:** 2,4 hectares  
**Árvores cadastradas:** ~125  
**Espécies:** 20 espécies nativas  
**Coordenadas:** Centro em lat -16.686, lng -49.264  

### Espécies catalogadas
1. Ipê-amarelo (*Handroanthus ochraceus*)
2. Ipê-roxo (*Handroanthus impetiginosus*)
3. Pequi (*Caryocar brasiliense*)
4. Baru (*Dipteryx alata*)
5. Jatobá (*Hymenaea stigonocarpa*)
6. Aroeira (*Myracrodruon urundeuva*)
7. Pau-brasil (*Paubrasilia echinata*)
8. Cagaita (*Eugenia dysenterica*)
9. Jacarandá-do-cerrado (*Machaerium opacum*)
10. Embaúba (*Cecropia pachystachya*)
11. Buriti (*Mauritia flexuosa*)
12. Candeia (*Eremanthus erythropappus*)
13. Murici (*Byrsonima crassifolia*)
14. Sucupira-preta (*Bowdichia virgilioides*)
15. Lobeira (*Solanum lycocarpum*)
16. Copaíba (*Copaifera langsdorffii*)
17. Angico-do-cerrado (*Anadenanthera falcata*)
18. Ingá (*Inga vera*)
19. Gonçalo-alves (*Astronium fraxinifolium*)
20. Caju-do-cerrado (*Anacardium humile*)

---

*Documento vivo — atualizado a cada fase do projeto.*
