# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern full-stack monorepo built with:

- **Frontend**: React 19 + TanStack Start (Router) + Vite + Jotai (state) + Nitro (SSR)
- **Backend**: Hono.js with OpenAPI + Zod validation + Stoker utilities
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth with session management
- **Build System**: Turborepo + PNPM workspaces
- **Code Quality**: Oxlint + Oxfmt (with Tailwind CSS support)

## Common Commands

### Development

```bash
pnpm dev              # Start all dev servers (web + api)
                      # Note: This automatically runs Docker Compose for PostgreSQL
                      # and starts SDK watch mode (see turbo.json task configuration)
```

### Building

```bash
pnpm build            # Build all packages
pnpm start            # Start production builds
```

### Database Operations

```bash
turbo db:generate     # Generate Drizzle migrations from schema changes
turbo db:migrate      # Run database migrations
turbo db:studio       # Open Drizzle Studio (database GUI)
turbo db:seed         # Seed database with initial data
```

### SDK Generation

```bash
turbo sdk:generate              # Generate API client from OpenAPI spec
turbo sdk:generate:watch        # Watch mode for SDK generation (auto-regenerates)
                                # Note: This runs automatically when you run pnpm dev
```

### Linting & Type Checking

```bash
turbo lint           # Lint all packages
turbo lint:fix       # Fix linting issues
turbo typecheck      # Type check all packages
```

### Working with Specific Packages

```bash
pnpm f <package> <command>   # Run command in specific package
# Example: pnpm f api dev
```

### Cleanup

```bash
pnpm cleanup          # Remove all build artifacts, caches, and node_modules
```

## Architecture

### Monorepo Structure

```
starter/
├── apps/
│   ├── api/         # Hono.js backend API
│   └── web/         # React + TanStack frontend
├── libs/
│   ├── auth/        # Better Auth configuration
│   ├── db/          # Drizzle ORM schemas and client
│   ├── sdk/         # Auto-generated API client
│   └── permix/      # Permission utilities
├── configs/
│   ├── tsconfig/    # Shared TypeScript configs
│   └── tailwind/    # Tailwind CSS setup
└── tools/
    └── seed/        # Database seeding scripts
```

### API Architecture (`apps/api/`)

The backend is built with **Hono.js** and follows a modular route structure:

- **Entry point**: `src/index.ts` - Creates the main app, sets up middleware, and starts the server
- **v1 factory**: `src/app/v1.factory.ts` - Creates the `/api/v1` app with middleware stack (CORS, logging, auth, request ID)
- **Modules**: `src/modules/*/` - Feature modules with routes, services, and models
  - Each module typically has: `index.ts` (routes), `service.ts` (business logic), `model.ts` (types/schemas)
- **Utilities**: Stoker for Hono helper functions
- **API Docs**: Scalar API Reference for interactive documentation at `/api/docs`

**Key middleware stack** (applied in order):

1. Request ID generation
2. Trailing slash normalization
3. Pino logging
4. CORS
5. Better Auth handler (for `/auth/*` routes)
6. Session injection middleware (sets `c.var.user` and `c.var.session`)

**API routes are mounted at `/api/v1/*`**

**API Documentation**: Scalar API Reference is available at `/api/docs`

### Frontend Architecture (`apps/web/`)

The frontend uses **TanStack Router** (via TanStack Start) for file-based routing:

- **Router**: `src/router.tsx` - TanStack Router configuration
- **Routes**: `src/routes/*.tsx` - File-based routing (see `routeTree.gen.ts`)
- **Client entry**: `src/client.tsx` - React app entry point
- **State Management**: Jotai for atomic state management
- **SSR**: Nitro for server-side rendering and isomorphic functionality

**Using the SDK**:

```typescript
import { miscService } from "@repo/sdk/sdk";
// Auto-generated TanStack Query hooks
import { useGetMiscHello } from "@repo/sdk/query";
```

### Database Layer (`libs/db/`)

- **Schemas**: `src/schemas/` - Drizzle schema definitions
- **Client**: `src/client.ts` - Database connection pool
- **Exports**:
  - `@repo/db` - Main exports
  - `@repo/db/client` - Database client only
  - `@repo/db/schema` - Schema exports

### Authentication (`libs/auth/`)

Uses **Better Auth** with Drizzle adapter:

- **Server**: `src/server.ts` - Auth configuration for API
- **Client**: `src/client.ts` - Auth client for frontend
- **Plugins**: OpenAPI integration + admin plugin

### SDK Auto-Generation (`libs/sdk/`)

The SDK is automatically generated from the API's OpenAPI spec using `@hey-api/openapi-ts`:

- **Input**: OpenAPI spec (URL or local `openapi.json`)
- **Output**: TypeScript client, Zod schemas, TanStack Query hooks
- **Watch mode**: Runs during `pnpm dev` to auto-regenerate on API changes
- **Post-processing**: Generated files are automatically formatted with Oxfmt and linted with Oxlint

**Generated exports**:

- `@repo/sdk/client` - Axios-based HTTP client
- `@repo/sdk/sdk` - Service clients grouped by tag
- `@repo/sdk/types` - TypeScript types
- `@repo/sdk/zod` - Zod validation schemas
- `@repo/sdk/query` - TanStack Query hooks

## Environment Variables

Environment variables use **Next.js convention** (loaded via `@dotenvx/dotenvx`):

1. Copy `.env.example` to `.env`
2. Variables are automatically loaded with the correct prefix (`VITE_` for web, plain for api)

### Development Infrastructure

**PostgreSQL** (via Docker Compose):

- Container name: `db-postgres`
- Auto-started with `pnpm dev`
- Configuration in `docker-compose.dev.yml`
- Uses trust authentication for local development

**Required variables**:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Better Auth secret
- `OPENAPI_URL` - OpenAPI spec URL for SDK generation (optional, falls back to local file)

## Code Quality

**IMPORTANT**: After making any modifications or improvements to the codebase, always run:

```bash
pnpm quality:fix      # Fix linting issues and format all code
```

This command runs both `oxlint --fix` and `oxfmt` to ensure consistent code quality across the monorepo.

## Development Workflow

1. **Start development**:

   ```bash
   pnpm dev  # Starts PostgreSQL (via Docker Compose) + API + Web + SDK watch mode
   ```

2. **Make API changes**:
   - Edit routes in `apps/api/src/modules/*/`
   - SDK auto-regenerates (watch mode running)
   - Frontend types update automatically

3. **Make database changes**:
   - Edit schema in `libs/db/src/schemas/`
   - Run `turbo db:generate` to create migration
   - Run `turbo db:migrate` to apply migration

4. **Run production build**:
   ```bash
   pnpm build
   pnpm start
   ```

## Key Patterns

### Adding a New API Module

1. Create `apps/api/src/modules/<name>/index.ts` with routes
2. Use `createV1RouteApp()` from `@/app/v1.factory`
3. Register in `apps/api/src/index.ts`
4. SDK will auto-generate new service client

### Using Generated SDK in Frontend

```typescript
import { useGetMiscHello } from "@repo/sdk/query";

function MyComponent() {
  const { data, isLoading } = useGetMiscHello({
    query: {
      // TanStack Query options
    },
  });
}
```

### Database Queries

```typescript
import { db } from "@repo/db/client";
import { users } from "@repo/db/schema";

const result = await db.select().from(users);
```

## Tooling

- **Turbo**: Task orchestration and caching
- **Oxlint**: Fast linter with React, TypeScript, import, and JSX-a11y plugins
- **Oxfmt**: Code formatter with experimental Tailwind CSS support
- **PNPM**: Package manager with workspace support
- **TypeScript**: Strict mode, ES2022 target
- **Node**: Required >=22
- **Docker Compose**: PostgreSQL container for local development (`docker-compose.dev.yml`)
