# Zetris Core

ERP SaaS para pequenas e médias empresas. Stack: Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL, Auth.js.

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o banco de dados:
   ```bash
   cp .env.example .env
   # edite .env com sua string de conexão PostgreSQL e gere um AUTH_SECRET
   ```

3. Crie as tabelas e popule dados de teste (⚠️ desta vez o schema mudou de verdade — Billing, Feature Flags e Admin adicionaram tabelas novas):
   ```bash
   npx prisma migrate dev --name billing_and_admin
   npx prisma db seed
   ```

4. Rode o projeto:
   ```bash
   npm run dev
   ```

5. Login de teste (criado pelo seed): `admin@zetris.com` / `123456`

## 🏗️ Arquitetura Enterprise — Status por Sprint

### ✅ Sprint 0 — Fundação arquitetural
Logger estruturado (pino), Event Bus interno, auditoria automática via eventos, camada de domínio pura (`src/core/`), Portas & Adaptadores (módulo Clientes como referência). Testes: `npm test`.

### ✅ Sprint 1 — Billing (Stripe)
Modelos `Plan`, `Subscription`, `Invoice`, `WebhookEvent`. Trial automático de 30 dias no cadastro. Checkout e Portal do Cliente via Stripe. Webhook idempotente em `/api/webhooks/stripe`. Aba "Assinatura" em Configurações.

**Para funcionar de verdade, você precisa:**
1. Criar um produto e um preço recorrente no [Dashboard do Stripe](https://dashboard.stripe.com/products) (modo Test primeiro)
2. Copiar o Price ID para `STRIPE_PRICE_ID_CORE` no `.env`
3. Copiar a Secret Key para `STRIPE_SECRET_KEY`
4. Para testar webhooks localmente, instalar a [Stripe CLI](https://stripe.com/docs/stripe-cli) e rodar: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` — isso te dá o `STRIPE_WEBHOOK_SECRET`

### ✅ Sprint 2 — Feature Flags
Catálogo central em `src/lib/feature-flags/features.ts`, checagem via `hasFeature(companyId, Feature.X)` com cache curto em memória. Cada plano tem suas features padrão definidas em `DEFAULT_PLAN_FEATURES`. Já usado para liberar/bloquear Analytics e ZIA.

### ✅ Sprint 3 — Painel Admin da Zetris
Rota `/admin`, protegida por `isPlatformAdmin` (novo campo no `User`, separado do papel dentro da empresa). Métricas reais: MRR, ARR, receita total, empresas por status, crescimento mensal, churn rate. CAC e LTV aparecem como "sem dados ainda" **de propósito** — a plataforma ainda não coleta o necessário para calculá-los honestamente.

O usuário do seed (`admin@zetris.com`) já é `isPlatformAdmin: true` — acesse `/admin` depois de logar.

### ⚠️ Sprint 4 — Jobs assíncronos & Observabilidade (parcial)
O que **existe**: logger estruturado, auditoria automática via Event Bus.
O que **falta**: fila real (BullMQ + Redis) para processamento assíncrono. Isso exige um servidor Redis, que este ambiente de desenvolvimento não provisiona sozinho. O Event Bus atual já foi desenhado para essa migração ser só uma troca de implementação interna — nenhum módulo que chama `eventBus.emit()` precisará mudar.

### ✅ Sprint 5 — Zetris Analytics (versão inicial)
Página `/analytics`: ticket médio, comparação com mês anterior, clientes ativos/inativos, produtos com menor saída. Gated pela feature `analytics.basic`. Dashboards personalizados, drill-down e comparação entre filiais ficam para quando os planos Pro/Business existirem de verdade no Stripe.

### ⚠️ Sprint 6 — ZIA (scaffold funcional, não é IA generativa ainda)
Widget flutuante funcionando de ponta a ponta, respondendo com dados **reais** da empresa (receita, estoque, ticket médio, clientes) — mas hoje por **regras**, não por um modelo de IA. Isso está documentado no próprio código (`src/modules/zia/actions/zia.actions.ts`) com o caminho exato para plugar uma IA de verdade (Anthropic/OpenAI) sem mudar a interface.

### ✅ Sprint 7 — PWA
Manifest, ícones (192/512), Service Worker com cache de assets estáticos e fallback offline. Instalável pelo navegador. Dados de negócio nunca são cacheados offline — só o "app shell".

### ⚠️ Sprint 8 — Performance (pontual)
Cache TTL em memória (`src/lib/cache/memory-cache.ts`) aplicado nas métricas do painel admin (60s). Deliberadamente **não** aplicado em estoque/vendas/caixa — dado teria que ser sempre fresco ali, e cache errado nesses fluxos é pior do que não ter cache. Lazy loading, code splitting e otimização de queries continuam como próximos passos quando o volume de dados justificar.



### ✅ Backend completo — todos os módulos do Core implementados

- **Auth** — cadastro, login, logout, recuperação de senha (Auth.js)
- **Multiempresa** — isolamento total de dados via `companyId` (`src/lib/session-guard.ts`)
- **Dashboard** — cards de indicadores, gráficos (receita mensal, produtos mais vendidos), últimas vendas
- **Clientes** — CRUD completo + busca + paginação (módulo de referência)
- **Produtos** — CRUD completo, categorias, fornecedores, cálculo de margem, movimentação automática de estoque no cadastro/edição
- **Estoque** — entrada, saída, ajuste manual e inventário (recontagem), com atualização automática do produto e alerta de estoque mínimo
- **Vendas** — fluxo completo: cliente → itens dinâmicos → desconto → pagamento → baixa automática de estoque → lançamento automático no fluxo de caixa → cancelamento com estorno de estoque e reversão financeira
- **Financeiro** — contas a pagar/receber com baixa em um clique, fluxo de caixa com saldo consolidado (entradas − saídas)
- **Relatórios** — exportação real em PDF (`@react-pdf/renderer`), Excel (`ExcelJS`) e CSV, para os 5 tipos: financeiro, clientes, produtos, estoque e vendas (rota `/api/reports/[type]`)
- **Configurações** — perfil (dados + senha), empresa, usuários com RBAC (Owner/Admin/Manager/Staff), preferências de tema

### 🚧 Próxima fase: Frontend / UX de produção
Com o backend fechado, os próximos passos sugeridos são:
- Revisão visual fina (loading states, empty states, skeletons)
- Upload real de imagens (produto/logo) em vez de campo de URL
- Notificações em tempo real (estoque baixo, contas vencendo)
- Testes end-to-end dos fluxos críticos (venda → estoque → financeiro)
- Deploy na Vercel + banco de produção

Cada módulo segue exatamente o mesmo padrão do módulo `customers`:
```
src/modules/<nome>/
  ├── schemas/      # validação Zod
  ├── types/        # tipos TS
  ├── repository/   # acesso a dados (sempre escopado por companyId)
  ├── services/     # regras de negócio (transações, cálculos)
  ├── actions/      # Server Actions
  ├── hooks/        # hooks React Query (client-side)
  └── components/   # UI do módulo
```

## 🏢 Finalização Enterprise do Backend (rodada mais recente)

### ✅ Totalmente implementado e funcional
- **Cache**: `ICache` + adaptador memória + adaptador Redis real (`REDIS_URL` ativa automaticamente)
- **Fila de jobs**: `IJobQueue` + adaptador in-process real + adaptador BullMQ real (`REDIS_URL` ativa automaticamente)
- **E-mail**: Resend real, com `EmailLog` de auditoria e templates (boas-vindas, reset de senha, pagamento, cancelamento)
- **Eventos**: login/logout, registro, reset de senha, pagamento confirmado/falhou, mudança de assinatura, estoque atualizado — todos auditados automaticamente
- **Feature Flags**: `FeatureFlagService` com 4 tiers formais (Core/Pro/Business/Enterprise)
- **Analytics Engine**: calculadoras desacopladas (receita, lucro bruto/líquido, margem, ticket médio, top produtos, produtos parados, Curva ABC, clientes mais importantes, fluxo de caixa, MRR/ARR/Churn). **LTV calculado com fórmula real** (receita média ÷ churn). Dashboard, ZIA, Painel Admin e BI Export consomem tudo daqui — zero duplicação
- **Forecast Engine**: modelo de regressão linear e média móvel **funcionando de verdade** hoje, atrás da porta `IForecastModel`
- **BI Export**: `/api/v1/bi/[type]` — endpoints versionados para Power BI/Looker Studio consumirem via conector Web/JSON (mantivemos o nome interno "Zetris Analytics", sem adotar a marca de terceiro)
- **ZIA**: arquitetura completa (providers/prompts/memory/tools) com adaptadores **reais** para Anthropic, OpenAI e Gemini — funciona assim que você configurar uma API key
- **Painel Admin**: métricas de IA, saúde do sistema (ping no banco), pagamentos Stripe recentes, auditoria em tempo real
- **Segurança**: rate limit real (token bucket) em rotas sensíveis, headers HTTP de segurança (`next.config.mjs`)

### ⚠️ Porta pronta, mas exige infraestrutura externa que este ambiente não provisiona sozinho
- **Prophet / ARIMA / LSTM**: interface `IForecastModel` implementada e documentada — a implementação real exige um microserviço Python (`FORECAST_ML_SERVICE_URL`), que este projeto não pode gerar sozinho
- **Provedor de IA local**: porta pronta (`LocalProvider`), aguardando um endpoint de inferência (Ollama/vLLM)
- **Redis em produção**: sem `REDIS_URL`, cache e fila funcionam em memória (corretos para uma instância; múltiplas instâncias exigem Redis)

### Variáveis de ambiente novas
Veja `.env.example` — adicionamos `AI_DEFAULT_PROVIDER`, `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`/`GEMINI_API_KEY`, `RESEND_API_KEY`, `REDIS_URL`, `FORECAST_ML_SERVICE_URL`.

### Depois de atualizar
```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

## 🎨 Correções visuais e novas integrações (rodada mais recente)

### Bug corrigido: linha de néon invisível no app
A linha animada (`GlowFlowLine`) estava sendo pintada **atrás** do fundo preto do próprio container (conflito de `z-index` negativo com `fixed`). Corrigido em `(dashboard)/layout.tsx` e `(admin)/layout.tsx`.

### Login refeito fielmente à referência
Nova página em `src/app/login/page.tsx` (fora do grupo `(auth)`, que continua servindo Cadastro/Recuperar senha): hero de marketing à esquerda (logo, headline, badges de módulos, estatísticas) + card de acesso à direita (e-mail/senha com ícones, mostrar senha, lembrar de mim, Google, criar conta) + rodapé.

### Login com Google
Adicionado como provedor **condicional** no Auth.js — só ativa se `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` estiverem no `.env` (veja `.env.example`). Sem essas chaves, o botão simplesmente não aparece.
⚠️ Isso exigiu tornar `User.passwordHash` opcional no schema (usuários via Google não têm senha local) — rode `npx prisma db push` de novo depois de atualizar.

### Leitor óptico (câmera)
`src/components/scanner/barcode-scanner-dialog.tsx` — leitura de código de barras via câmera (webcam/celular), usando `html5-qrcode`. Integrado em:
- **Produtos**: botão ao lado do campo "Código de barras" preenche automaticamente
- **Vendas**: botão "Escanear" adiciona o item na venda direto (ou soma quantidade se já estiver na lista)

Leitores USB dedicados (que funcionam como teclado) **não precisam** deste componente — eles já digitam o código em qualquer campo focado.

⚠️ Acesso à câmera em produção exige HTTPS (localhost funciona sem certificado para testes).


CRM, RH, Logística, Produção, IA, Marketplace e Help Desk aparecem desabilitados na sidebar (`src/components/layout/sidebar.tsx`) como indicação visual da arquitetura modular, mas **não possuem nenhuma lógica implementada**, conforme escopo do Core.

## Segurança implementada
- Senhas com hash bcrypt
- Validação de entrada com Zod em todas as Server Actions
- Prisma previne SQL Injection por padrão (queries parametrizadas)
- Middleware de proteção de rotas (`src/middleware.ts`)
- Isolamento de dados por empresa em nível de repository

## Deploy
Projeto pronto para deploy na Vercel. Configure `DATABASE_URL` e `AUTH_SECRET` nas variáveis de ambiente do projeto.
