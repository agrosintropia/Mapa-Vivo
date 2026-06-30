# Mapa Vivo — Inteligência Urbana Verde

**Plataforma SaaS de inventário arbóreo digital**
por **Agrosintropia** | Goiânia, GO - Brasil

---

## O que é o Mapa Vivo?

O Mapa Vivo é uma plataforma digital que transforma a gestão de áreas verdes em condomínios, parques, incorporadoras e agroflorestas. Cada árvore recebe uma identidade digital com mapa interativo, QR code individual, plaquinha física identificadora e relatórios ambientais em tempo real.

A plataforma conecta gestores, técnicos ambientais e moradores em um ecossistema colaborativo de monitoramento e valorização do patrimônio verde.

---

## Problema que Resolvemos

- Condomínios e parques não sabem quantas árvores possuem, quais são as espécies ou seu estado de saúde
- Não há registros organizados de podas, plantios ou ocorrências
- Moradores não têm canal para reportar problemas com árvores
- Não existe medição do impacto ambiental (carbono, biodiversidade)
- Visitas técnicas carecem de ferramentas digitais para registro em campo
- Árvores não possuem identificação física acessível ao público

---

## Solução

### Mapa Interativo Georreferenciado
Cada árvore aparece no mapa com informações completas: espécie, família, estrato, estado de saúde, medidas (DAP e altura), fotos e histórico de eventos.

### QR Code Individual com Plaquinha Física
Cada árvore recebe um QR code único e uma plaquinha física instalada no local. Moradores e visitantes escaneiam e acessam a ficha completa da árvore pelo celular — sem precisar de aplicativo.

### Dashboard Ambiental
Painel com estatísticas em tempo real: total de árvores, espécies catalogadas, percentual de nativas, espécies ameaçadas, carbono estocado (biomassa, CO₂eq), distribuição por estrato e subclasse.

### Validação Técnica
Sistema de confiabilidade com três níveis: validado por técnico, pendente de validação e declarado pelo gestor. Fila de revisão com aprovação técnica.

### Catálogo de Biodiversidade
Classificação por subclasses: nativa, exótica, frutífera, medicinal, melífera, ameaçada de extinção, madeireira, ornamental e pioneira.

---

## Funcionalidades por Perfil

### Morador
- Visualizar mapa interativo com todas as árvores
- Acessar fichas de árvores via QR code (escaneando a plaquinha)
- Consultar dashboard ambiental do projeto
- Reportar observações (árvore doente, necessidade de poda, etc.)
- Página de ajuda com FAQ e guia de uso

### Gestor do Condomínio/Parque
- Tudo do morador, mais:
- Painel de gestão com lista de árvores cadastradas
- Cadastrar novas árvores (com foto, localização GPS e dados de plantio)
- Gerenciar moradores autorizados (cadastro por nome/email/telefone)
- Gerar link de convite com código único + controle por email
- Revisar observações dos moradores (aceitar, rejeitar, encaminhar para técnico)
- Acompanhar visitas técnicas e histórico
- Solicitar serviços técnicos (visita presencial, revisão online, nova área)
- Botão "+" para cadastro rápido de árvores

### Técnico Ambiental
- Tudo do gestor, mais:
- Iniciar e conduzir visitas técnicas digitais em campo
- Cadastrar árvores com captura GPS automática e foto com compressão
- Identificar espécies e instalar plaquinhas com QR code durante a visita
- Editar dados de árvores existentes durante a visita
- Cadastrar novas espécies (inclusive "não identificada")
- Criar sub-áreas dentro do projeto
- Validar árvores com selo de confiabilidade técnica
- Editar informações de espécies (subclasses, função ecológica, fauna atraída)
- Visualizar solicitações atribuídas pelo administrador
- Histórico completo de ações realizadas em cada visita

### Administrador (Agrosintropia)
- Painel administrativo com métricas globais
- Gerenciar projetos: nome, plano, status, gestor, taxa de setup
- Barra de progresso de expiração do plano (alerta < 2 meses)
- Cadastrar e gerenciar técnicos
- Atribuir solicitações de serviço a técnicos
- Painel de revisões com arquivos (fotos, áudio, texto)
- Controle financeiro: receita mensal, taxas de setup, cobranças de visitas e plaquinhas
- Badges com contagens de itens pendentes em cada aba

---

## Planos e Preços

| | Básico | Standard | Premium |
|---|---|---|---|
| **Preço mensal** | R$ 479 | R$ 679 | R$ 1.379 |
| **Limite de árvores** | 200 | 500 | 1.500 |
| **Visitas técnicas/ano** | 0 | 1 | 2 |
| Mapeamento de árvores | Sim | Sim | Sim |
| QR codes individuais | Sim | Sim | Sim |
| Painel do gestor | Sim | Sim | Sim |
| Observações de moradores | Sim | Sim | Sim |
| Relatório básico | Sim | Sim | Sim |
| Sub-áreas ilimitadas | — | Sim | Sim |
| Relatório completo de diversidade | — | Sim | Sim |
| Exportação CSV | — | Sim | Sim |
| API de integração | — | — | Sim |
| Suporte prioritário | — | — | Sim |
| Relatório personalizado | — | — | Sim |

**Visitas técnicas inclusas**: sem custo do técnico nos planos Standard e Premium. Os custos de deslocamento sempre são cobrados. Visitas adicionais cobradas separadamente.

**Taxa de setup**: cobrada uma vez na ativação do projeto (valor configurável pelo administrador, parcelável).

**Vigência**: 12 meses a partir da ativação do plano.

---

## Fluxo de Onboarding

1. **Contato comercial** — gestor ou incorporadora entra em contato com a Agrosintropia
2. **Administrador cria o projeto** — define nome, localização, plano e gestor responsável
3. **Visita técnica inicial (obrigatória)** — um técnico da Agrosintropia vai ao local para:
   - Identificar e catalogar todas as árvores (espécie, medidas, estado de saúde)
   - Capturar fotos e coordenadas GPS de cada árvore
   - Instalar plaquinhas físicas com QR code em cada árvore identificada
   - Validar o inventário com selo de confiabilidade técnica
4. **Cobrança da visita e plaquinhas** — o cliente paga pela visita técnica inicial + plaquinhas instaladas
5. **Gestor acessa o sistema** — faz login com Google, é redirecionado ao dashboard do projeto já com todas as árvores cadastradas
6. **Gestor cadastra moradores** — adiciona nome e email dos moradores autorizados
7. **Gestor gera link de convite** — envia link com código único aos moradores
8. **Moradores acessam** — fazem login com Google, email é verificado contra a lista autorizada, e já podem explorar o mapa, escanear QR codes e reportar observações

---

## Modelo de Receita

| Fonte de receita | Descrição | Recorrência |
|---|---|---|
| **Assinatura mensal** | Planos Básico, Standard ou Premium | Mensal |
| **Taxa de setup** | Cobrança única na ativação do projeto (parcelável) | Única |
| **Visita técnica inicial** | Obrigatória — identificação, catalogação e instalação de plaquinhas | Única |
| **Visitas técnicas adicionais** | Taxa base + custo de deslocamento | Sob demanda |
| **Plaquinhas com QR code** | Venda de plaquinhas físicas instaladas nas árvores (margem de 30%) | Sob demanda |
| **Revisões técnicas online** | Taxa por lote de árvores revisadas remotamente | Sob demanda |

### Detalhamento — Plaquinhas com QR Code

As plaquinhas são produzidas e instaladas pela Agrosintropia durante a visita técnica. Cada plaquinha contém:
- QR code único vinculado à ficha digital da árvore
- Nome popular e científico da espécie
- Logotipo do Mapa Vivo

A margem de lucro por plaquinha é de **30%** sobre o custo de produção. A venda é feita por unidade, acompanhando o número de árvores catalogadas no projeto.

---

## Serviços Técnicos

| Serviço | Descrição |
|---|---|
| **Visita técnica inicial** | Técnico vai ao local, identifica espécies, cadastra árvores com GPS e foto, instala plaquinhas |
| **Visita técnica adicional** | Atualização do inventário, novas árvores, substituição de plaquinhas |
| **Revisão técnica online** | Técnico revisa remotamente árvores cadastradas pelo gestor |
| **Setup de nova área** | Configuração de nova área dentro do projeto existente |

---

## Tecnologia

| Componente | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes + Prisma ORM |
| Banco de dados | PostgreSQL |
| Autenticação | NextAuth v5 com Google OAuth |
| Mapa | Leaflet via react-leaflet |
| Hospedagem | Railway |
| Fotos | Compressão client-side (WebP, 1200px máx.) |

### Destaques Técnicos
- **100% responsivo** — funciona em celular, tablet e desktop
- **PWA-ready** — acesso direto pelo navegador, sem necessidade de app store
- **QR codes** — cada árvore tem URL pública acessível sem login
- **Compressão de imagens** — fotos são comprimidas automaticamente antes do envio
- **GPS nativo** — captura automática de coordenadas pelo celular durante cadastro
- **Dashboard em tempo real** — cálculo de carbono, biodiversidade e estatísticas atualizadas
- **Planilha integrada ao mapa** — lista de árvores sincronizada com filtros ativos

---

## Diferenciais Competitivos

1. **Simplicidade** — não precisa instalar aplicativo, funciona no navegador do celular
2. **Plaquinhas com QR code** — cada árvore recebe identificação física acessível a qualquer pessoa
3. **Colaborativo** — moradores reportam observações, gestor revisa, técnico valida
4. **Métricas ambientais** — carbono estocado, percentual de nativas, espécies ameaçadas
5. **Escalável** — de um pequeno condomínio (50 árvores) a grandes parques (5.000+ árvores)
6. **Selo de confiabilidade** — três níveis de validação que dão credibilidade ao inventário
7. **Visita técnica profissional** — inventário inicial sempre feito por técnico especializado

---

## Público-Alvo

- **Condomínios residenciais** — gestão do patrimônio arbóreo, relatórios para assembleias
- **Parques urbanos** — inventário e monitoramento de biodiversidade
- **Incorporadoras** — valorização ambiental de empreendimentos, compliance ESG
- **Agroflorestas** — catálogo de espécies e acompanhamento de plantios
- **Prefeituras** — inventário arbóreo urbano com dados georreferenciados

---

## Contato

**Agrosintropia**
Consultoria em meio ambiente e agroflorestas

- Email: agrosintropia@gmail.com
- Localização: Goiânia, GO — Brasil
- Site: mapa-vivo-production.up.railway.app

---

*Mapa Vivo — Cada árvore ganha identidade.*
