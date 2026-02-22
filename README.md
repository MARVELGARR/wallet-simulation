# Tobedeleted Project

A modern, type-safe authentication and user management system built with Node.js, Express, and Drizzle ORM. This project is currently under active development.

## 🚀 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/) (v5)
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via `pg` driver)
- **Validation**: [Zod](https://zod.dev/)
- **Security**:
  - [bcrypt](https://www.npmjs.com/package/bcrypt) for password hashing
  - [JWT (JSON Web Tokens)](https://jwt.io/) for session management (Access & Refresh tokens)
- **Development**: [tsx](https://tsx.is/) (watch mode), [TypeScript](https://www.typescriptlang.org/)

## 🏗️ Architecture

The project follows a clean, layered architecture to separate concerns and ensure maintainability:

1.  **API Layer (`app/routers`)**: Express controllers that handle HTTP requests/responses and route them to services.
2.  **Service Layer (`app/services`)**: Business logic, input validation (Zod), and coordination between DALs and security utilities.
3.  **Data Access Layer (DAL) (`app/data-access-layer`)**: The only layer that interacts with the database via Drizzle ORM.
4.  **Database Layer (`app/database`)**: Schema definitions, migrations, and database configuration.

## 📁 Project Structure

```text
tobedeleted/
├── app/
│   ├── data-access-layer/  # DAL: Direct DB interactions
│   ├── database/           # Schema & migrations
│   ├── routers/            # API Controllers
│   ├── server/             # App entry point
│   ├── services/           # Business logic & services
│   └── settings/           # App & DB configurations
├── .env                    # Environment variables (local)
├── drizzle.config.ts       # Drizzle configuration
├── package.json            # Scripts & dependencies
└── tsconfig.json           # TypeScript configuration
```

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A PostgreSQL instance

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgres://user:password@localhost:5432/db_name
PORT=3000
JWT_SECRET=your_super_secret_key
```

### 4. Database Migrations
Generate and run migrations using Drizzle Kit:
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

### 5. Development
Run the development server with hot-reload:
```bash
npm run dev
```

## 🛣️ API Endpoints (v1)

### Authentication
- `POST /api/v1/auth/register` - Create a new user account. Returns access and refresh tokens.
- `POST /api/v1/auth/login` - Authenticate and receive access and refresh tokens.
- `POST /api/v1/auth/refresh` - Swap a refresh token for a new access/refresh pair (token rotation).
- `POST /api/v1/auth/logout` - Revoke a refresh token and end the session.

---

*Note: This project is for learning purposes and is still ongoing.*
