<div align="center">

# 💰 Wallet Simulation API

**A production-grade, event-driven digital wallet system built with Node.js, Express v5, and TypeScript.**

[![Node.js](https://img.shields.io/badge/Node.js-≥20.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-v5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-Latest-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Deployed on Render](https://img.shields.io/badge/Render-Deployed-46E3B7?logo=render&logoColor=white)](https://wallet-simulation.onrender.com)

[Live Demo](https://wallet-simulation.onrender.com) · [API Reference](#-api-reference) · [Getting Started](#-getting-started)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
  - [High-Level Architecture](#high-level-architecture)
  - [Layered Architecture](#layered-architecture)
  - [Request Lifecycle](#request-lifecycle)
  - [Event-Driven Architecture (EDA)](#event-driven-architecture-eda)
  - [Structured Logging](#-structured-logging)
  - [Authentication Flow](#authentication-flow)
- [Database Schema](#-database-schema)
  - [Entity Relationship Diagram](#entity-relationship-diagram)
  - [Table Definitions](#table-definitions)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#1-prerequisites)
  - [Installation](#2-installation)
  - [Environment Setup](#3-environment-setup)
  - [Database Migrations](#4-database-migrations)
  - [Development](#5-development)
- [API Reference](#-api-reference)
  - [Authentication Endpoints](#authentication)
  - [User Endpoints](#users)
  - [Wallet Endpoints](#wallets)
  - [Transaction Endpoints](#transactions)
  - [Event Endpoints (Internal)](#event-endpoints-internal--qstash)
- [Security & Middleware](#-security--middleware)
- [Error Handling](#-error-handling)
- [Deployment](#-deployment)
  - [Render](#deploy-to-render)
  - [Docker](#deploy-with-docker)
- [Environment Variables Reference](#-environment-variables-reference)
- [NPM Scripts](#-npm-scripts)
- [License](#-license)

---

## 🌟 Overview

**Wallet Simulation API** is a RESTful backend system that simulates a digital wallet platform. Users can register, authenticate, and manage a personal wallet — performing **deposits**, **withdrawals**, and **peer-to-peer transfers**. All financial transactions are processed **asynchronously** using an event-driven architecture powered by **Upstash QStash**, ensuring reliability, auditability, and eventual consistency.

> **Why async transactions?** Instead of blocking the HTTP request while processing money movement, the API immediately responds with `202 Accepted` and a transaction ID. The actual balance update happens in the background via a verified QStash webhook, mimicking how real-world payment systems work.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Access & refresh token pair with rotation and revocation |
| 👛 **Automatic Wallet Creation** | Wallets are created asynchronously upon user registration via QStash events |
| 💸 **Deposits** | Add funds to a wallet with full transaction ledger tracking |
| 💳 **Withdrawals** | Withdraw funds with balance validation |
| 🔄 **Peer-to-Peer Transfers** | Transfer money between wallets atomically |
| 📒 **Transaction Ledger** | Every financial operation is recorded with status tracking (`pending` → `completed` / `failed`) |
| ⚡ **Event-Driven Processing** | All financial operations are processed asynchronously via Upstash QStash |
| 🔒 **QStash Signature Verification** | Webhook payloads are cryptographically verified to prevent tampering |
| 🗃️ **Database Row Locking** | `SELECT ... FOR UPDATE` prevents race conditions during concurrent transactions |
| 🚀 **Production-Ready** | Deployed on Render with Neon PostgreSQL, auto-migrations on startup |

---

## 🛠️ Tech Stack

```
┌──────────────────────────────────────────────────────────┐
│                    WALLET SIMULATION API                  │
├──────────────┬───────────────────────────────────────────┤
│  Runtime     │  Node.js ≥ 20 (ES Modules)               │
│  Framework   │  Express.js v5                            │
│  Language    │  TypeScript 5.9 (strict mode)             │
│  ORM         │  Drizzle ORM                              │
│  Database    │  PostgreSQL (Neon Serverless)              │
│  Validation  │  Zod v4                                   │
│  Auth        │  JWT (jsonwebtoken) + bcrypt              │
│  Events/MQ   │  Upstash QStash (HTTP-based message queue)│
│  Logging     │  Pino (Structured JSON logs)              │
│  Dev Server  │  tsx (watch mode, ESM support)            │
│  Deployment  │  Render / Docker                          │
└──────────────┴───────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

### High-Level Architecture

The system is composed of four main actors: the **Client**, the **API Server**, the **Database**, and the **Event Queue (QStash)**. Here's how they interact:

```mermaid
graph TB
    subgraph Client["Client (Browser / Postman / Mobile)"]
        C[HTTP Requests]
    end

    subgraph Server["API Server (Express v5)"]
        MW["Middleware Layer\nCORS • JSON Parser • Auth"]
        R["Router Layer\nControllers"]
        S["Service Layer\nBusiness Logic • Validation"]
        DAL["Data Access Layer\nDrizzle ORM Queries"]
        EH["Event Handlers\nQStash Webhooks"]
    end

    subgraph DB["Neon PostgreSQL"]
        UT[users]
        RT[refresh_tokens]
        WT[wallets]
        TT[transactions]
    end

    subgraph MQ["Upstash QStash"]
        Q["Message Queue\nHTTP Webhooks"]
    end

    C -->|REST API| MW
    MW --> R
    R --> S
    S --> DAL
    DAL --> DB

    S -->|Publish Event| Q
    Q -->|Webhook Callback| EH
    EH --> DAL

    style Client fill:#1a1a2e,stroke:#e94560,color:#fff
    style Server fill:#16213e,stroke:#0f3460,color:#fff
    style DB fill:#0f3460,stroke:#533483,color:#fff
    style MQ fill:#533483,stroke:#e94560,color:#fff
```

### Layered Architecture

The codebase follows a **strict layered architecture** where each layer has a single responsibility and only communicates with its immediate neighbors:

```mermaid
graph TD
    subgraph Layer1["🌐 API Layer (Controllers)"]
        direction LR
        AC["auth.controller.ts"]
        TC["transaction.controller.ts"]
        UC["user.controller.ts"]
        WC["wallet.controller.ts"]
    end

    subgraph Layer2["⚙️ Service Layer (Business Logic)"]
        direction LR
        AS["auth-service/"]
        PS["payment-service/"]
        US["user-service/"]
        WS["wallet-service/"]
        NS["notification-service/"]
    end

    subgraph Layer3["💾 Data Access Layer (DAL)"]
        direction LR
        AD["auth/ DAL"]
        TD["transaction/ DAL"]
        UD["user/ DAL"]
        WD["wallet/ DAL"]
    end

    subgraph Layer4["🗄️ Database Layer"]
        direction LR
        SCH["schema.ts<br/>(Table Definitions)"]
        MIG["migrations/<br/>(SQL Files)"]
    end

    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4

    style Layer1 fill:#e94560,stroke:#fff,color:#fff
    style Layer2 fill:#0f3460,stroke:#fff,color:#fff
    style Layer3 fill:#533483,stroke:#fff,color:#fff
    style Layer4 fill:#1a1a2e,stroke:#fff,color:#fff
```

| Layer | Directory | Responsibility |
|---|---|---|
| **API (Controllers)** | `app/routers/` | Parse HTTP requests, call services, return HTTP responses |
| **Service** | `app/services/` | Input validation (Zod), business rules, orchestration, token management |
| **Data Access (DAL)** | `app/data-access-layer/` | Direct database interactions via Drizzle ORM — the **only** layer that touches the DB |
| **Database** | `app/database/` | Schema definitions (Drizzle), SQL migration files |
| **Settings** | `app/settings/` | App configuration, DB connection, router setup, QStash config, middleware, error classes |

> **Rule:** Controllers never import from the DAL directly. Services never write raw SQL. The DAL never handles HTTP concerns.

---

### Request Lifecycle

Here's what happens when a client makes an API call, from start to finish:

```mermaid
sequenceDiagram
    participant C as 🖥️ Client
    participant MW as 🛡️ Middleware
    participant R as 🔀 Router/Controller
    participant S as ⚙️ Service
    participant DAL as 💾 DAL
    participant DB as 🗄️ Database

    C->>MW: HTTP Request
    Note over MW: 1. CORS check
    Note over MW: 2. JSON body parsing
    Note over MW: 3. Auth token validation<br/>(if protected route)
    MW->>R: Parsed request + req.user
    R->>S: Call service with raw input
    Note over S: 4. Zod schema validation
    Note over S: 5. Business logic<br/>(hash password, sign JWT, etc.)
    S->>DAL: Call DAL method
    DAL->>DB: Drizzle ORM query
    DB-->>DAL: Query result
    DAL-->>S: Typed result
    S-->>R: ServiceResult<T>
    R-->>C: HTTP Response (JSON)
```

---

### Event-Driven Architecture (EDA)

Financial transactions (deposits, withdrawals, transfers) are processed **asynchronously** via Upstash QStash. This ensures the client isn't blocked waiting for potentially slow operations and provides built-in retry logic.

```mermaid
sequenceDiagram
    participant C as 🖥️ Client
    participant API as ⚙️ API Server
    participant DB as 🗄️ Database
    participant QS as 📨 QStash
    participant EH as 🔔 Event Handler

    C->>API: POST /api/v1/deposit-transac<br/>{ amount, walletId }
    
    rect rgb(30, 30, 60)
        Note over API,DB: Database Transaction (Atomic)
        API->>DB: 1. Lock wallet row (FOR UPDATE)
        API->>DB: 2. Insert transaction (status: "pending")
        API->>QS: 3. Publish event to QStash
    end

    API-->>C: 202 Accepted { txId: "..." }
    
    Note over C: Client can poll /transactions/:id<br/>for status updates

    rect rgb(60, 30, 30)
        Note over QS,EH: Async Processing
        QS->>EH: POST /api/v1/deposit_event<br/>(with signature header)
        Note over EH: 4. Verify QStash signature
        Note over EH: 5. Parse raw body
        EH->>DB: 6. Fetch transaction (FOR UPDATE)
        EH->>DB: 7. Update wallet balance
        EH->>DB: 8. Mark transaction "completed"
        EH-->>QS: 200 OK
    end
```

**Key Design Decisions:**

- **Raw body parsing for QStash routes:** QStash event routes use `express.raw()` instead of `express.json()` so the signature can be verified against the original bytes. The event router is mounted **before** the global JSON parser.
- **Signature verification:** Every incoming QStash webhook is verified using HMAC signatures (current + next signing key rotation).
- **Transaction status tracking:** Transactions start as `pending`, then move to `completed` or `failed` after async processing.
- **Row-level locking:** `SELECT ... FOR UPDATE` prevents race conditions when multiple events try to modify the same wallet.

---

### 📊 Structured Logging

The application uses **Pino** for high-performance, structured JSON logging. This is crucial for production monitoring and debugging asynchronous event flows.

**Key Features:**
- **Context-Aware:** Child loggers are used for each module (`auth`, `db`, `wallet`, `event`, etc.), automatically tagging log lines with their source.
- **Environment-Specific:**
  - **Development:** Prints human-readable, colorized logs via `pino-pretty`.
  - **Production:** Outputs raw JSON for efficient ingestion by log aggregators (e.g., Datadog, ELK, CloudWatch).
- **Fatal Error Handling:** The server logs a `fatal` event and shuts down gracefully if migrations fail on startup.

**Usage Example:**
```typescript
import { transactionLogger } from "../settings/logger.js";

try {
    // logic...
} catch (err) {
    transactionLogger.error({ err, txId: "..." }, "Transaction processing failed");
}
```

---

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as 🖥️ Client
    participant API as ⚙️ Auth Controller
    participant SVC as 🔐 Auth Service
    participant DB as 🗄️ Database
    participant QS as 📨 QStash

    Note over C,QS: Registration Flow
    C->>API: POST /auth/register { name, email, password }
    API->>SVC: RegisterUser(rawInput)
    Note over SVC: Zod validation
    Note over SVC: bcrypt hash password (salt rounds: 10)
    SVC->>DB: INSERT into users table
    SVC->>DB: INSERT refresh token
    SVC->>QS: Publish "create-wallet" event
    SVC-->>API: { user, accessToken, refreshToken }
    API-->>C: 201 Created

    Note over C,QS: Login Flow
    C->>API: POST /auth/login { email, password }
    API->>SVC: LoginUser(rawInput)
    Note over SVC: Zod validation
    SVC->>DB: SELECT user by email
    Note over SVC: bcrypt.compare(password, hash)
    SVC->>DB: INSERT new refresh token
    SVC-->>API: { user, accessToken, refreshToken }
    API-->>C: 200 OK

    Note over C,QS: Token Refresh (Rotation)
    C->>API: POST /auth/refresh { refreshToken }
    API->>SVC: RefreshTokens(token)
    SVC->>DB: SELECT token, verify not revoked/expired
    SVC->>DB: REVOKE old refresh token
    SVC->>DB: INSERT new refresh token
    SVC-->>API: { accessToken, newRefreshToken }
    API-->>C: 200 OK
```

**Token Strategy:**

| Token | Lifetime | Purpose |
|---|---|---|
| **Access Token** | 15 minutes | Sent in `Authorization: Bearer <token>` header for protected routes |
| **Refresh Token** | 7 days | Used to obtain a new access/refresh pair without re-entering credentials |

- **Token Rotation:** Each refresh request revokes the old refresh token and issues a brand-new pair, preventing token replay attacks.
- **Logout:** Explicitly revokes the refresh token in the database, ending the session.

---

## 🗃️ Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK "Primary Key (auto-generated)"
        text name "User's display name"
        text email UK "Unique email address"
        text password "bcrypt hash"
        timestamp created_at "Default: now()"
        timestamp updated_at "Default: now()"
    }

    REFRESH_TOKENS {
        uuid id PK "Primary Key (auto-generated)"
        uuid user_id FK "References users.id (CASCADE)"
        text token UK "Unique JWT refresh token"
        timestamp expires_at "Token expiration"
        boolean revoked "Default: false"
        timestamp created_at "Default: now()"
    }

    WALLETS {
        uuid id PK "Primary Key (auto-generated)"
        uuid user_id FK,UK "References users.id (CASCADE, unique)"
        decimal balance "precision: 12, scale: 2, default: 0.00"
        varchar currency "length: 3, default: USD"
        timestamp updated_at "Default: now()"
    }

    TRANSACTIONS {
        uuid id PK "Primary Key (auto-generated)"
        uuid sender_wallet_id FK "References wallets.id (nullable)"
        uuid receiver_wallet_id FK "References wallets.id (nullable)"
        decimal amount "precision: 12, scale: 2"
        enum type "deposit | withdrawal | transfer"
        enum status "pending | completed | failed"
        varchar reference "Optional reference string"
        timestamp created_at "Default: now()"
    }

    USERS ||--o{ REFRESH_TOKENS : "has many"
    USERS ||--o| WALLETS : "has one"
    WALLETS ||--o{ TRANSACTIONS : "sends"
    WALLETS ||--o{ TRANSACTIONS : "receives"
```

### Table Definitions

#### `users`
Stores registered user accounts. Passwords are **never** stored in plain text — only bcrypt hashes.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | NOT NULL, UNIQUE |
| `password` | TEXT | NOT NULL (bcrypt hash) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

#### `refresh_tokens`
Tracks active user sessions. Supports token revocation for logout and token rotation for security.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `user_id` | UUID | FK → `users.id` (CASCADE) |
| `token` | TEXT | NOT NULL, UNIQUE |
| `expires_at` | TIMESTAMP | NOT NULL |
| `revoked` | BOOLEAN | NOT NULL, DEFAULT `false` |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

#### `wallets`
One wallet per user. Uses `DECIMAL(12,2)` for monetary precision (avoids floating-point errors). Maximum value: `9,999,999,999.99`.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `user_id` | UUID | FK → `users.id` (CASCADE), UNIQUE |
| `balance` | DECIMAL(12,2) | NOT NULL, DEFAULT `0.00` |
| `currency` | VARCHAR(3) | NOT NULL, DEFAULT `USD` |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

#### `transactions`
The financial ledger. Every money movement creates a record here, enabling full audit trails.

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `sender_wallet_id` | UUID | FK → `wallets.id` (nullable — null for deposits) |
| `receiver_wallet_id` | UUID | FK → `wallets.id` (nullable — null for withdrawals) |
| `amount` | DECIMAL(12,2) | NOT NULL |
| `type` | ENUM | `deposit` \| `withdrawal` \| `transfer` |
| `status` | ENUM | `pending` \| `completed` \| `failed` (DEFAULT `pending`) |
| `reference` | VARCHAR(255) | Optional |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

---

## 📁 Folder Structure

Below is the **complete** project directory tree with explanations for every file:

```
wallet-simulation/
│
├── 📄 .env                          # Local environment variables (git-ignored)
├── 📄 .env.example                  # Template for required environment variables
├── 📄 .gitignore                    # Git ignore rules
├── 📄 .dockerignore                 # Docker ignore rules
├── 🐳 dockerfile                    # Docker container definition
├── 📄 render.yaml                   # Render.com IaC deployment blueprint
├── 📄 package.json                  # Dependencies, scripts, metadata
├── 📄 package-lock.json             # Locked dependency versions
├── 📄 tsconfig.json                 # TypeScript compiler configuration
├── 📄 api.rest                      # REST Client test file (VS Code REST Client extension)
├── 📄 README.md                     # This documentation
│
├── 📂 app/                          # ═══ APPLICATION SOURCE CODE ═══
│   │
│   ├── 📂 server/                   # ── Entry Point ──
│   │   └── 📄 index.ts              # Express app bootstrap, middleware mounting,
│   │                                #   route registration, migration runner, graceful shutdown
│   │
│   ├── 📂 settings/                 # ── Configuration & Infrastructure ──
│   │   ├── 📄 app.config.ts         # Creates and exports the Express app instance
│   │   ├── 📄 db.config.ts          # Neon PostgreSQL connection pool + Drizzle instance
│   │   ├── 📄 drizzle.config.ts     # Drizzle Kit config (schema path, migrations dir)
│   │   ├── 📄 router.config.ts      # Shared Express Router for standard API routes
│   │   ├── 📄 qstash.router.ts      # Dedicated Express Router for QStash event routes
│   │   ├── 📄 qstash.middleware.ts  # Raw body parser + QStash signature verification middleware
│   │   ├── 📄 upstach.qstach.config.ts  # QStash Client & Receiver setup, URL resolution
│   │   └── 📄 errorPerser.ts        # Custom error classes: AppError, NotFoundError,
│   │                                #   ConflictError, ValidationError, parseDatabaseError()
│   │
│   ├── 📂 database/                 # ── Schema & Migrations ──
│   │   ├── 📄 schema.ts             # Drizzle table definitions: users, refresh_tokens,
│   │   │                            #   wallets, transactions + TypeScript type exports
│   │   └── 📂 migrations/
│   │       ├── 📄 0000_first_jackal.sql  # Initial migration (creates all tables)
│   │       └── 📂 meta/                  # Drizzle Kit migration metadata
│   │
│   ├── 📂 routers/                  # ── API Controllers (HTTP Layer) ──
│   │   ├── 📄 auth.controller.ts    # POST /register, /login, /refresh, /logout, GET /me
│   │   ├── 📄 transaction.controller.ts  # POST /deposit, /transfer, /withdraw, GET /transactions/:id
│   │   ├── 📄 user.controller.ts    # GET /users, /users/:id, DELETE /users/:id
│   │   ├── 📄 wallet.controller.ts  # GET /wallets, /wallets/user/:userId
│   │   │
│   │   └── 📂 events/              # ── QStash Event Handlers (Webhooks) ──
│   │       ├── 📄 wallet.events.ts      # Handles "create-wallet" event after registration
│   │       ├── 📄 deposit.event.ts      # Processes deposit: updates balance, marks tx completed
│   │       ├── 📄 transfere.event.ts    # Processes transfer: debits sender, credits receiver
│   │       └── 📄 withdrawer.event.ts   # Processes withdrawal: debits wallet balance
│   │
│   ├── 📂 services/                 # ── Business Logic Layer ──
│   │   ├── 📂 auth-service/
│   │   │   ├── 📄 register.auth.ts      # Zod schema + RegisterUser() service function
│   │   │   ├── 📄 login.auth.ts         # Zod schema + LoginUser() service function
│   │   │   ├── 📄 refresh.auth.ts       # Token rotation logic
│   │   │   ├── 📄 logout.auth.ts        # Token revocation logic
│   │   │   ├── 📄 auth.middleware.ts     # requireAuth middleware (JWT verification)
│   │   │   ├── 📄 jwt.util.ts           # signAccessToken(), signRefreshToken(), verifyToken()
│   │   │   └── 📄 bcrypt.util.ts        # hashPassword(), comparePassword()
│   │   │
│   │   ├── 📂 payment-service/
│   │   │   ├── 📄 transaction.serviece.deposit.ts   # CompleteDeposit() — balance addition logic
│   │   │   ├── 📄 transaction.erviece..transer.ts   # CompleteTransfer() — debit/credit logic
│   │   │   └── 📄 transaction.service.withdrawer.ts # CompleteWithdrawal() — balance deduction logic
│   │   │
│   │   ├── 📂 wallet-service/
│   │   │   ├── 📄 create-wallet.ts  # CreateWallet() — inserts a new wallet for a user
│   │   │   └── 📄 get-wallets.ts    # GetAllWalletsService() — retrieves all wallets
│   │   │
│   │   ├── 📂 user-service/
│   │   │   └── 📄 user.get.ts       # fetchAllUsers(), fetchUserById(), removeUserById()
│   │   │
│   │   └── 📂 notification-service/
│   │       └── 📄 create-notification.ts  # Placeholder for future notification feature
│   │
│   └── 📂 data-access-layer/       # ── Database Queries (DAL) ──
│       ├── 📂 auth/
│       │   ├── 📄 auth.ts              # Registration() — insert user, handle email conflicts
│       │   └── 📄 refresh-token.ts     # saveRefreshToken(), findToken(), revokeToken()
│       │
│       ├── 📂 transaction/
│       │   ├── 📄 basics.ts            # Basic transaction CRUD operations
│       │   ├── 📄 deposit.ts           # Deposit-specific DB operations
│       │   ├── 📄 transfere.ts         # Transfer-specific DB operations
│       │   └── 📄 withdrawer.ts        # Withdrawal-specific DB operations
│       │
│       ├── 📂 user/
│       │   └── 📄 user.ts             # User CRUD: findByEmail, findById, getAll, deleteUser
│       │
│       └── 📂 wallet/
│           └── 📄 wallet.db.ts        # Wallet CRUD: createWallet, getWalletByUserId, updateBalance
│
└── 📂 dist/                         # ═══ COMPILED OUTPUT (git-ignored) ═══
    └── ...                           # TypeScript → JavaScript output
```

> **Design Pattern:** The project mirrors a **domain-driven** folder structure where each domain (auth, wallet, transaction, user) has its own set of files across all layers (controller → service → DAL).

---

## 🚀 Getting Started

### 1. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 20.0.0 | JavaScript runtime |
| [npm](https://www.npmjs.com/) | ≥ 9 | Package manager (bundled with Node) |
| [PostgreSQL](https://neon.tech/) | Any (Neon recommended) | Database — Neon provides free serverless PostgreSQL |

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/wallet-simulation.git
cd wallet-simulation

# Install dependencies
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and configure the following:

```env
# ─── Server ───────────────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ─── Database (Neon PostgreSQL) ────────────────────────────────
# Get your connection string from https://console.neon.tech/
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require

# ─── Auth (JWT) ───────────────────────────────────────────────
JWT_SECRET=your_super_secret_key_here
JWT_SECRET_PROD=your_production_secret_key_here
JWT_ISSUER=wallet-api
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ─── Upstash QStash (Event-Driven Architecture) ───────────────
# Get these from https://console.upstash.com/qstash
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=sig_xxxxx
QSTASH_NEXT_SIGNING_KEY=sig_xxxxx

# ─── App Public URL ───────────────────────────────────────────
# For local dev with QStash, use ngrok to create a public tunnel:
#   ngrok http 3000
# Then set the forwarding URL here.
APP_BASE_URL=http://localhost:3000
```

### 4. Database Migrations

The server **automatically runs migrations on startup**. However, you can also run them manually:

```bash
# Generate a new migration after schema changes
npx drizzle-kit generate

# Push schema directly (useful for development)
npx drizzle-kit push
```

### 5. Development

Start the development server with hot-reload:

```bash
npm run dev
```

The server will start at `http://localhost:3000` (or the port specified in `.env`).

```
[db.config] Mode: development — connecting to Neon PostgreSQL
[db.config] ✅ Neon database connected
[server] Running database migrations...
[server] ✅ Migrations complete
[server] Running on http://localhost:3000
```

---

## 📡 API Reference

**Base URL:** `https://wallet-simulation.onrender.com/api/v1` (production) or `http://localhost:3000/api/v1` (local)

### Authentication

<details>
<summary><code>POST</code> <code>/api/v1/auth/register</code> — Create a new user account</summary>

**Request Body:**
```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Validation Rules:**
| Field | Rules |
|---|---|
| `name` | Required, 2–5 characters, trimmed |
| `email` | Required, valid email format, normalized to lowercase |
| `password` | Required, 8–72 characters (bcrypt limit) |

**Success Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Side Effect:** A QStash event is published to create a wallet for the new user asynchronously.

**Error Responses:**
| Code | Scenario |
|---|---|
| `400` | Validation failed (details include field-level errors) |
| `409` | Email already registered |
</details>

<details>
<summary><code>POST</code> <code>/api/v1/auth/login</code> — Authenticate and get tokens</summary>

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "John", "email": "john@example.com" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```
</details>

<details>
<summary><code>POST</code> <code>/api/v1/auth/refresh</code> — Rotate tokens (get new access + refresh)</summary>

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response:** `200 OK`
```json
{
  "accessToken": "eyJ...(new)...",
  "refreshToken": "eyJ...(new)..."
}
```

> The old refresh token is revoked. This is **token rotation** — prevents replay attacks.
</details>

<details>
<summary><code>POST</code> <code>/api/v1/auth/logout</code> — Revoke refresh token</summary>

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```
</details>

<details>
<summary><code>GET</code> <code>/api/v1/auth/me</code> — Get current user profile 🔒</summary>

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response:** `200 OK`
```json
{
  "user": {
    "sub": "550e8400-...",
    "email": "john@example.com",
    "name": "John"
  }
}
```
</details>

---

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/users` | ❌ | List all users |
| `GET` | `/api/v1/users/:id` | 🔒 | Get user by ID |
| `DELETE` | `/api/v1/users/:id` | ❌ | Delete user (cascades to wallet & tokens) |

---

### Wallets

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/wallets` | ❌ | List all wallets |
| `GET` | `/api/v1/wallets/user/:userId` | ❌ | Get wallet by user ID |

---

### Transactions

<details>
<summary><code>POST</code> <code>/api/v1/deposit-transac</code> — Deposit funds into a wallet</summary>

**Request Body:**
```json
{
  "amount": 5000,
  "walletId": "79782bfe-371e-4e1a-80a2-05de388a0a8c"
}
```

**Success Response:** `202 Accepted`
```json
{
  "message": "Processing",
  "txId": "a1b2c3d4-..."
}
```

> The deposit is processed **asynchronously**. Poll `GET /transactions/:txId` for status.
</details>

<details>
<summary><code>POST</code> <code>/api/v1/transfer-money-transac</code> — Transfer between wallets</summary>

**Request Body:**
```json
{
  "senderWalletId": "aaa-bbb-ccc",
  "receiverWalletId": "ddd-eee-fff",
  "amount": 1500,
  "userId": "optional-user-id"
}
```

**Success Response:** `202 Accepted`
```json
{
  "message": "Transfer is being processed",
  "txId": "..."
}
```
</details>

<details>
<summary><code>POST</code> <code>/api/v1/withdrawer-money-transc</code> — Withdraw funds from a wallet</summary>

**Request Body:**
```json
{
  "WalletId": "79782bfe-371e-4e1a-80a2-05de388a0a8c",
  "userId": "577bbb6a-c109-4a78-a81d-1eb0caad5d71",
  "amount": 1000
}
```

**Success Response:** `202 Accepted`
```json
{
  "message": "withdrawer is being processed",
  "txId": "..."
}
```
</details>

<details>
<summary><code>GET</code> <code>/api/v1/transactions/:id</code> — Check transaction status</summary>

**Success Response:** `200 OK`
```json
{
  "id": "a1b2c3d4-...",
  "senderWalletId": null,
  "receiverWalletId": "79782bfe-...",
  "amount": "5000.00",
  "type": "deposit",
  "status": "completed",
  "reference": null,
  "createdAt": "2026-05-22T08:00:00.000Z"
}
```
</details>

---

### Event Endpoints (Internal — QStash)

> ⚠️ These endpoints are **not meant for direct client access**. They are called by QStash with signed webhook payloads. Requests without a valid `upstash-signature` header are rejected with `401`.

| Endpoint | Trigger | Purpose |
|---|---|---|
| `POST /api/v1/create-wallet-events` | User registration | Creates a wallet for the new user |
| `POST /api/v1/deposit_event` | Deposit initiated | Updates wallet balance, marks transaction completed |
| `POST /api/v1/transfer_event` | Transfer initiated | Debits sender, credits receiver, marks transaction completed |
| `POST /api/v1/withdraw_event` | Withdrawal initiated | Debits wallet balance, marks transaction completed |

---

## 🔒 Security & Middleware

### Middleware Stack

The middleware is applied in a **specific order** in `app/server/index.ts` — order matters!

```mermaid
graph LR
    A["1. QStash Event Router<br/>(raw body parser)"] --> B["2. express.json()<br/>(JSON body parser)"]
    B --> C["3. Standard API Routes<br/>(with requireAuth on protected routes)"]

    style A fill:#e94560,stroke:#fff,color:#fff
    style B fill:#0f3460,stroke:#fff,color:#fff
    style C fill:#533483,stroke:#fff,color:#fff
```

> **Why this order?** QStash event routes need access to the **raw request body** (as a Buffer) for signature verification. If `express.json()` runs first, the body is already parsed and the original bytes are lost.

### `requireAuth` Middleware

Protect any route by adding the `requireAuth` middleware. It automatically:
1. Extracts the JWT from the `Authorization: Bearer <token>` header
2. Verifies the token signature and expiration
3. Attaches the decoded payload to `req.user`

```typescript
import { requireAuth } from "../services/auth-service/auth.middleware.js";

// Usage — just add requireAuth before your route handler
router.get("/protected-route", requireAuth, (req, res) => {
    // req.user is now available with { sub, email, name }
    res.json({ user: req.user });
});
```

### `verifyQStash` Middleware

For QStash event handlers, the signature verification middleware chain looks like:

```typescript
import { rawBodyParser, verifyQStash } from "../../settings/qstash.middleware.js";

// Both middlewares must be applied in order:
eventRouter.post("/deposit_event", rawBodyParser, verifyQStash, async (req, res) => {
    // req.body is now the parsed JSON object (re-attached after verification)
});
```

---

## ⚠️ Error Handling

The project uses a **custom error hierarchy** for consistent error responses:

```mermaid
classDiagram
    Error <|-- AppError
    AppError <|-- NotFoundError
    AppError <|-- ConflictError
    AppError <|-- ValidationError

    class AppError {
        +string message
        +number statusCode
    }
    class NotFoundError {
        +statusCode = 404
    }
    class ConflictError {
        +statusCode = 409
    }
    class ValidationError {
        +statusCode = 400
    }
```

| Error Class | Status Code | When It's Thrown |
|---|---|---|
| `AppError` | Any | Base class — generic application errors |
| `NotFoundError` | `404` | Resource not found (user, wallet, transaction) |
| `ConflictError` | `409` | Duplicate entry (e.g., email already registered) |
| `ValidationError` | `400` | Input validation failures |

The `parseDatabaseError()` utility function maps common database error codes to the appropriate custom error:

```typescript
import { parseDatabaseError } from "../settings/errorPerser.js";

try {
    // database operation...
} catch (err) {
    throw parseDatabaseError(err); // Automatically maps to NotFound, Conflict, etc.
}
```

---

## 🚢 Deployment

### Deploy to Render

The project includes a `render.yaml` Infrastructure-as-Code blueprint. Render will automatically detect this file.

1. **Push to GitHub** / connect your repo to [Render](https://render.com)
2. **Create a new Web Service** → Render detects `render.yaml`
3. **Set secret environment variables** in the Render dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET` / `JWT_SECRET_PROD`
   - `QSTASH_TOKEN`
   - `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY`
   - `APP_BASE_URL` (set to your Render URL, e.g., `https://wallet-simulation.onrender.com`)

```yaml
# render.yaml summary:
services:
  - type: web
    name: wallet-api
    runtime: node
    buildCommand: npm run build      # npm install && tsc
    startCommand: node dist/server/index.js
    healthCheckPath: /
```

> Migrations run **automatically on server startup** — no manual migration step needed on deploy.

### Deploy with Docker

```bash
# Build the image
docker build -t wallet-api .

# Run the container
docker run -p 3000:3000 --env-file .env wallet-api
```

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "dev" ]
```

---

## 📋 Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | ❌ | `development` | `development` or `production` |
| `PORT` | ❌ | `3000` | HTTP server port |
| `LOG_LEVEL` | ❌ | `debug`/`info` | Minimum log level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`) |
| `DATABASE_URL` | ✅ | — | Neon PostgreSQL connection string (with `?sslmode=require`) |
| `JWT_SECRET` | ✅ | — | Secret key for signing JWTs (development) |
| `JWT_SECRET_PROD` | ✅ (prod) | — | Secret key for signing JWTs (production) |
| `JWT_ISSUER` | ❌ | `wallet-api` | JWT `iss` claim |
| `JWT_ACCESS_EXPIRES_IN` | ❌ | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | `7d` | Refresh token TTL |
| `QSTASH_URL` | ✅ | — | QStash API base URL |
| `QSTASH_TOKEN` | ✅ | — | QStash API authentication token |
| `QSTASH_CURRENT_SIGNING_KEY` | ✅ | — | Current webhook signing key |
| `QSTASH_NEXT_SIGNING_KEY` | ✅ | — | Next webhook signing key (for key rotation) |
| `APP_BASE_URL` | ✅ | `http://localhost:3000` | Public URL where QStash can reach your server |

---

## 📜 NPM Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `tsx watch app/server/index.ts` | Start dev server with hot-reload (ESM) |
| `npm run build` | `npm install && tsc` | Install deps + compile TypeScript to `dist/` |
| `npm start` | `node dist/server/index.js` | Start production server from compiled output |

---

## 📄 License

ISC © **Marvellous Obatale**

---

<div align="center">

**Built with ❤️ using Node.js, Express, TypeScript & Drizzle ORM**

*This project is for learning purposes and is under active development.*

</div>
