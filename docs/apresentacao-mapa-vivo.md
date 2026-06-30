# Mapa Vivo — Inteligencia Urbana Verde

**Plataforma SaaS de inventario arboreo digital**
por **Agrosintropia** | Goiania, GO - Brasil

---

## O que e o Mapa Vivo?

O Mapa Vivo e uma plataforma digital que transforma a gestao de areas verdes em condominios, parques, incorporadoras e agroflorestas. Cada arvore recebe uma identidade digital com mapa interativo, QR code individual e relatorios ambientais em tempo real.

A plataforma conecta gestores, tecnicos ambientais e moradores em um ecossistema colaborativo de monitoramento e valorizacao do patrimonio verde.

---

## Problema que Resolvemos

- Condominios e parques nao sabem quantas arvores possuem, quais sao as especies ou seu estado de saude
- Nao ha registros organizados de podas, plantios ou ocorrencias
- Moradores nao tem canal para reportar problemas com arvores
- Nao existe medicao do impacto ambiental (carbono, biodiversidade)
- Visitas tecnicas carecem de ferramentas digitais para registro em campo

---

## Solucao

### Mapa Interativo Georreferenciado
Cada arvore aparece no mapa com informacoes completas: especie, familia, estrato, estado de saude, medidas (DAP e altura), fotos e historico de eventos.

### QR Code Individual
Cada arvore recebe um QR code unico. Moradores e visitantes escaneiam e acessam a ficha completa da arvore pelo celular — sem precisar de app.

### Dashboard Ambiental
Painel com estatisticas em tempo real: total de arvores, especies catalogadas, percentual de nativas, especies ameacadas, carbono estocado (biomassa, CO2eq), distribuicao por estrato e subclasse.

### Validacao Tecnica
Sistema de confiabilidade com tres niveis: validado por tecnico, pendente de validacao e declarado pelo gestor. Fila de revisao com aprovacao tecnica.

### Catalogo de Biodiversidade
Classificacao por subclasses: nativa, exotica, frutífera, medicinal, melifera, ameacada de extincao, madeireira, ornamental e pioneira.

---

## Funcionalidades por Perfil

### Morador
- Visualizar mapa interativo com todas as arvores
- Acessar fichas de arvores via QR code
- Consultar dashboard ambiental do projeto
- Reportar observacoes (arvore doente, necessidade de poda, etc.)
- Pagina de ajuda com FAQ e guia de uso

### Gestor do Condominio/Parque
- Tudo do morador, mais:
- Painel de gestao com lista de arvores cadastradas
- Cadastrar novas arvores (com foto, localizacao GPS e dados de plantio)
- Gerenciar moradores autorizados (cadastro por nome/email/telefone)
- Gerar link de convite com codigo unico + controle por email
- Revisar observacoes dos moradores (aceitar, rejeitar, encaminhar para tecnico)
- Acompanhar visitas tecnicas e historico
- Solicitar servicos tecnicos (visita presencial, revisao online, nova area)
- Botao "+" para cadastro rapido de arvores

### Tecnico Ambiental
- Tudo do gestor, mais:
- Iniciar e conduzir visitas tecnicas digitais em campo
- Cadastrar arvores com captura GPS automatica e foto com compressao
- Editar dados de arvores existentes durante a visita
- Cadastrar novas especies (inclusive "nao identificada")
- Criar sub-areas dentro do projeto
- Validar arvores com selo de confiabilidade tecnica
- Editar informacoes de especies (subclasses, funcao ecologica, fauna atraida)
- Visualizar solicitacoes atribuidas pelo admin
- Historico completo de acoes realizadas em cada visita

### Administrador (Agrosintropia)
- Painel administrativo com metricas globais
- Gerenciar projetos: nome, plano, status, gestor, taxa de setup
- Barra de progresso de expiracao do plano (alerta < 2 meses)
- Cadastrar e gerenciar tecnicos
- Atribuir solicitacoes de servico a tecnicos
- Painel de revisoes com arquivos (fotos, audio, texto)
- Controle financeiro: receita mensal, taxas de setup, cobrancas de visitas
- Badges com contagens de itens pendentes em cada aba

---

## Planos e Precos

| | Basico | Standard | Premium |
|---|---|---|---|
| **Preco mensal** | R$ 479 | R$ 679 | R$ 1.379 |
| **Limite de arvores** | 200 | 1.000 | 5.000 |
| **Visitas tecnicas/ano** | 0 | 1 | 2 |
| Mapeamento de arvores | Sim | Sim | Sim |
| QR codes individuais | Sim | Sim | Sim |
| Painel do gestor | Sim | Sim | Sim |
| Observacoes de moradores | Sim | Sim | Sim |
| Relatorio basico | Sim | Sim | Sim |
| Sub-areas ilimitadas | — | Sim | Sim |
| Relatorio completo de diversidade | — | Sim | Sim |
| Exportacao CSV | — | Sim | Sim |
| API de integracao | — | — | Sim |
| Suporte prioritario | — | — | Sim |
| Relatorio personalizado | — | — | Sim |

**Visitas tecnicas**: custo de deslocamento cobrado separadamente.

**Taxa de setup**: cobrada uma vez na ativacao do projeto (valor configuravel pelo admin, parcelavel).

**Vigencia**: 12 meses a partir da ativacao do plano.

---

## Servicos Tecnicos Adicionais

| Servico | Descricao |
|---|---|
| **Visita tecnica presencial** | Tecnico vai ao local, cadastra arvores com GPS e foto, valida especies |
| **Revisao tecnica online** | Tecnico revisa remotamente arvores cadastradas pelo gestor |
| **Setup de nova area** | Configuracao de nova area dentro do projeto existente |

---

## Modelo de Receita

1. **Assinatura mensal** — planos Basico, Standard ou Premium
2. **Taxa de setup** — cobranca unica na ativacao (parcelavel)
3. **Visitas tecnicas** — taxa base + custo de deslocamento
4. **Revisoes online** — taxa por lote de arvores revisadas

---

## Fluxo de Onboarding

1. **Contato comercial** — gestor ou incorporadora entra em contato com a Agrosintropia
2. **Admin cria o projeto** — define nome, localizacao, plano e gestor responsavel
3. **Gestor acessa o sistema** — faz login com Google, e redirecionado ao dashboard do projeto
4. **Gestor cadastra moradores** — adiciona nome e email dos moradores autorizados
5. **Gestor gera link de convite** — envia link com codigo unico aos moradores
6. **Moradores acessam** — fazem login com Google, email e verificado contra a lista autorizada
7. **Visita tecnica** (opcional) — tecnico vai ao local, cadastra e valida as arvores

---

## Tecnologia

| Componente | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes + Prisma ORM |
| Banco de dados | PostgreSQL |
| Autenticacao | NextAuth v5 com Google OAuth |
| Mapa | Leaflet via react-leaflet |
| Hospedagem | Railway |
| Fotos | Compressao client-side (WebP, 1200px max) |

### Destaques Tecnicos
- **100% responsivo** — funciona em celular, tablet e desktop
- **PWA-ready** — acesso direto pelo navegador, sem necessidade de app store
- **QR codes** — cada arvore tem URL publica acessivel sem login
- **Compressao de imagens** — fotos sao comprimidas automaticamente antes do envio
- **GPS nativo** — captura automatica de coordenadas pelo celular durante cadastro
- **Dashboard em tempo real** — calculo de carbono, biodiversidade e estatisticas atualizadas

---

## Diferenciais Competitivos

1. **Simplicidade** — nao precisa instalar app, funciona no navegador do celular
2. **QR codes fisicos** — cada arvore pode ter uma plaquinha com QR code para visitantes
3. **Colaborativo** — moradores reportam observacoes, gestor revisa, tecnico valida
4. **Metricas ambientais** — carbono estocado, percentual de nativas, especies ameacadas
5. **Escalavel** — de um pequeno condominio (50 arvores) a grandes parques (5.000+ arvores)
6. **Selo de confiabilidade** — tres niveis de validacao que dao credibilidade ao inventario

---

## Publico-Alvo

- **Condominios residenciais** — gestao do patrimonio arboreo, relatorios para assembleias
- **Parques urbanos** — inventario e monitoramento de biodiversidade
- **Incorporadoras** — valorizacao ambiental de empreendimentos, compliance ESG
- **Agroflorestas** — catalogo de especies e acompanhamento de plantios
- **Prefeituras** — inventario arboreo urbano com dados georreferenciados

---

## Contato

**Agrosintropia**
Consultoria em meio ambiente e agroflorestas

- Email: agrosintropia@gmail.com
- Localizacao: Goiania, GO — Brasil
- Site: mapa-vivo-production.up.railway.app

---

*Mapa Vivo — Cada arvore ganha identidade.*
