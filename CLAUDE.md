# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Reitrop** is a data integration platform that syncs data between various third-party services (Salesforce, HubSpot, Stripe, Slack, Zendesk, Intercom) with an approval workflow for managing sync changes.

**Tech Stack:**

- **Frontend**: React 19 + TanStack Start (Router) + Vite + Jotai (state) + Nitro (SSR)
- **Backend**: Hono.js with OpenAPI + Zod validation + Stoker utilities
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth with session management (currently using mock auth for development)
- **Build System**: Turborepo + PNPM workspaces
- **Code Quality**: Oxlint + Oxfmt (with Tailwind CSS support)

## Business Domain

The application manages third-party integrations with a sync approval workflow:

1. **Integrations**: Six supported services - Salesforce, HubSpot, Stripe, Slack, Zendesk, Intercom
2. **Sync Process**: External API provides sync changes that need approval
3. **Change Types**: ADD (new entity), UPDATE (field modification), DELETE (entity removal)
4. **Approval Workflow**: Users review and accept/discard individual changes

**External API**: `https://portier-takehometest.onrender.com/api/v1/data/sync`

## Important Documentation

**ASSUMPTIONS.md** - Documents assumptions made about external APIs and data structures. Review this file when working with integrations or sync endpoints to understand the expected behavior and data patterns.

## Development Setup

### Initial Setup

```bash
# Install dependencies
pnpm install

# Set up environment files (copies .env.example to .env)
pnpm setup-project
```

### Mock Authentication

The system currently uses mock authentication for development:

- **Email**: `admin@admin.com`
- **Password**: `password`

Mock user data is defined in `apps/api/src/mock.ts` and `apps/api/src/modules/auth/index.ts`. JWT tokens are generated server-side and stored in localStorage via the `sessionJwtAtom` (Jotai).

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
```

### API Architecture (`apps/api/`)

The backend is built with **Hono.js** and follows a modular route structure:

- **Entry point**: `src/index.ts` - Creates the main app, sets up middleware, and starts the server
- **v1 factory**: `src/app/v1.factory.ts` - Creates the `/api/v1` app with middleware stack (CORS, logging, auth, request ID)
- **Modules**: `src/modules/*/` - Feature modules with routes
  - `auth/` - Authentication endpoints (login, me)
  - `integration/` (mounted at `/data`) - Integration management, sync endpoints, resolve workflow
  - `misc/` - Miscellaneous endpoints
- **Utilities**: Stoker for Hono helper functions, custom error handling
- **API Docs**: Scalar API Reference for interactive documentation at `/api/docs`

**Key middleware stack** (applied in order):

1. Request ID generation
2. Trailing slash normalization
3. Pino logging
4. CORS
5. JWT session injection middleware (sets `c.var.session` from Authorization header)

**API routes are mounted at `/api/v1/*`**

**API Documentation**: Scalar API Reference is available at `/api/docs`

### API Modules

**Auth Module** (`/api/v1/auth`):

- `POST /login` - Authenticate with email/password, returns JWT token
- `GET /me` - Get current user session

**Integration Module** (`/api/v1/data`):

- `GET /list` - Get all integrations with optional search
- `GET /{application_id}` - Get specific integration details
- `GET /{application_id}/history` - Get sync history for an integration
- `GET /sync?application_id={id}` - Proxy to external API for sync data
- `POST /{application_id}/resolve` - Accept/discard sync changes

**Mock Data**: Integrations are mocked in `apps/api/src/mock.ts` for development.

### Frontend Architecture (`apps/web/`)

The frontend uses **TanStack Router** (via TanStack Start) for file-based routing:

- **Router**: `src/router.tsx` - TanStack Router configuration with SSR query integration
- **Routes**: `src/routes/*.tsx` - File-based routing (see `routeTree.gen.ts`)
- **Client entry**: `src/client.tsx` - React app entry point
- **State Management**: Jotai for atomic state management (session JWT)
- **SSR**: Nitro for server-side rendering and isomorphic functionality
- **Styling**: Tailwind CSS 4.x with custom components (shadcn-style)

**Frontend Routes**:

- `/` - Root/landing
- `/dashboard` - Main dashboard with integrations table
- `/dashboard/$applicationId` - Integration detail page
- `/dashboard/$applicationId/resolve` - Sync approval/resolve page

**Using the SDK**:

```typescript
// Auto-generated TanStack Query hooks
import { useGetApiV1DataList, getApiV1DataListOptions } from "@repo/sdk/query";

// In components
const { data, isLoading } = useGetApiV1DataList({
  query: { search: "hubspot" },
});

// In loaders
await context.queryClient.fetchQuery(getApiV1DataListOptions());
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

- **Server**: `src/server.ts` - Auth configuration for API (currently not fully integrated, using mock auth)
- **Client**: `src/client.ts` - Auth client for frontend
- **Plugins**: OpenAPI integration + admin plugin

**Current Auth Flow**:

1. User logs in via `/api/v1/auth/login` with mock credentials
2. Server generates JWT token with session data
3. Token stored in localStorage via `sessionJwtAtom` (Jotai)
4. SDK client intercepts requests and adds `Authorization: Bearer {token}` header
5. Server validates JWT and injects session into `c.var.session`

**State Management**:

- `sessionJwtAtom` in `apps/web/src/atoms/index.ts` - Jotai atom for session JWT
- SDK configured in `apps/web/src/routes/-setup.ts` with request interceptor

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

1. Copy `.env.example` to `.env` (use `pnpm setup-project` to automate)
2. Variables are automatically loaded with the correct prefix (`VITE_` for web, plain for api)

### Development Infrastructure

**PostgreSQL** (via Docker Compose):

- Container name: `db-postgres`
- Auto-started with `pnpm dev`
- Configuration in `docker-compose.dev.yml`
- Uses trust authentication for local development

**API** (`apps/api/.env`):

- `APP_ENV=development`
- `API_PORT=4200`
- `DATABASE_URL=postgresql://postgres:@localhost:5432/postgres`
- `AUTH_SECRET=your_auth_secret_here_more_than_thirty_two_chars`

**Web** (`apps/web/.env`):

- `VITE_APP_ENV=development`
- `VITE_API_URL=http://localhost:4200`
- `VITE_BUILD_SHA=local`

**SDK** (`libs/sdk/.env`):

- `OPENAPI_URL=http://localhost:4200/api/docs/json` (optional, falls back to local file)

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
   - Add new schemas to `apps/api/src/schema/` for type safety

3. **Make database changes**:
   - Edit schema in `libs/db/src/schemas/`
   - Run `turbo db:generate` to create migration
   - Run `turbo db:migrate` to apply migration

4. **Run production build**:

   ```bash
   pnpm build
   pnpm start
   ```

5. **Always run quality checks**:
   ```bash
   pnpm quality:fix  # Fix linting issues and format all code
   ```

## Common Issues & Solutions

### SDK Not Regenerating

If SDK doesn't auto-regenerate:

1. Check that `pnpm dev` is running (watch mode active)
2. Manually run: `pnpm f sdk sdk:generate`
3. Verify OpenAPI spec is accessible at `http://localhost:4200/api/docs/json`

### Auth Issues

If authentication fails:

1. Verify using mock credentials: `admin@admin.com` / `password`
2. Check localStorage for `session` key
3. Verify JWT token in Authorization header
4. Check that AUTH_SECRET is set in `.env`

### Database Connection Issues

If database connection fails:

1. Ensure PostgreSQL container is running: `docker ps`
2. Check DATABASE_URL in `.env` files
3. Verify port 5432 is available
4. Check `docker-compose.dev.yml` configuration

## Key Patterns

### API Response Format

All successful responses follow this structure:

```typescript
{
  ok: true,
  data: T,           // Response data
  message: "Success",
  requestId: string  // Request tracking ID
}
```

Error responses:

```typescript
{
  ok: false,
  errorCode: string, // e.g., "MALFORMED_INPUT", "UNAUTHORIZED"
  message: string,
  requestId: string
}
```

### Frontend Route Patterns

**Protected Routes**: Dashboard routes check authentication in loaders:

```typescript
loader: async ({ context }) => {
  try {
    await context.queryClient.fetchQuery(getApiV1AuthMeOptions());
  } catch {
    return redirect({ to: "/" });
  }
};
```

**Route Params Validation**: Use Zod schemas for type-safe params:

```typescript
params: {
  parse: ({ applicationId }) => {
    const parseResult = zApplicationId.safeParse(applicationId);
    if (!parseResult.success) throw notFound();
    return { applicationId: parseResult.data };
  };
}
```

### UI Components

The app uses custom UI components (shadcn-style) in `apps/web/src/components/ui/`:

- `Button`, `Card`, `Input`, `DataTable`, `Skeleton`, etc.
- `DataTable` - Custom table component using TanStack Table with row click handlers
- Components follow Tailwind CSS 4.x patterns

### Date Formatting

**Dayjs** is configured in `apps/web/src/routes/-setup.ts`:

- Plugins: UTC, timezone, relativeTime
- Default timezone: Asia/Jakarta
- Use `dayjs().to(timestamp)` for relative time display

### State Management

**Jotai** is used for client-side state:

- `sessionJwtAtom` - Stores JWT token in localStorage
- Import from `@/atoms/index`

### Data Table Pattern

When creating data tables with TanStack Table:

```typescript
const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: "field",
    header: "Label",
    cell: ({ row }) => <Component data={row.original} />
  }
];

<DataTable
  columns={columns}
  data={data}
  isLoading={isLoading}
  bodyRowOptions={{
    onClick: (item) => navigate({ to: "/path", params: { id: item.id } }),
    className: "cursor-pointer"
  }}
/>
```

## Important Files & Patterns

### Mock Data

- `apps/api/src/mock.ts` - Contains MOCK_USER and INTEGRATIONS array
- Edit this file to add/modify integrations during development
- In-memory sync events stored in `Map<string, SyncEvent[]>` in integration module

### Error Handling

- `apps/api/src/lib/error.ts` - Typed API error system with dictionary
- Use `ApiError.CODE_NAME` for consistent error responses
- Error handling middleware catches and formats errors

### Response Helpers

- `apps/api/src/lib/response.ts` - Response builders for consistent API responses
- Use `okRes(data, requestId)` for success responses
- Use `zOkRes(schema)` for OpenAPI response schemas

### Schema Definitions

- `apps/api/src/schema/integrations.ts` - Integration-related Zod schemas
- `apps/api/src/schema/auth.ts` - Auth-related Zod schemas
- Schemas are exported to SDK and used for type safety

## Architecture Decisions & Conventions

### Module Organization

- **Feature-based modules**: Each API module groups related functionality
- **Shared schemas**: Common types defined in `apps/api/src/schema/`
- **Zod-first**: All validation uses Zod schemas, shared via SDK
- **OpenAPI-driven**: API spec is source of truth for SDK generation

### Type Safety

- **End-to-end types**: Types flow from API schemas → SDK → Frontend
- **No `any` types**: Use Zod schemas for external data validation
- **Strict mode**: TypeScript strict mode enabled across all packages

### Error Handling

- **Typed errors**: Use `ApiError.CODE_NAME` for consistent error responses
- **HTTP status codes**: Proper status codes for different error scenarios
- **Request tracking**: All responses include `requestId` for debugging

### State Management Strategy

- **Server state**: TanStack Query for API data (cache, refetch, deduplication)
- **Client state**: Jotai atoms for UI state (session, UI preferences)
- **URL state**: TanStack Router for navigation and route state

### Code Style

- **No comments**: Code should be self-documenting
- **Short functions**: Keep functions focused and concise
- **Early returns**: Prefer early returns over nested conditions
- **Type inference**: Let TypeScript infer types when possible

## Tooling

- **Turbo**: Task orchestration and caching
- **Oxlint**: Fast linter with React, TypeScript, import, and JSX-a11y plugins
- **Oxfmt**: Code formatter with experimental Tailwind CSS support
- **PNPM**: Package manager with workspace support (version 10.33.0)
- **TypeScript**: Strict mode, ES2022 target (version 6.0.2)
- **Node**: Required >=24 (updated from >=22)
- **Docker Compose**: PostgreSQL container for local development (`docker-compose.dev.yml`)
- **@dotenvx/dotenvx**: Environment variable management with Next.js convention
- **esbuild**: Fast bundler for API builds

## Testing & Debugging

### API Documentation

- Scalar API Reference: `http://localhost:4200/api/docs`
- Interactive testing of all endpoints
- Auto-generated from OpenAPI specs

### DevTools

- React Query Devtools (client-side)
- TanStack Router Devtools (routing)
- Both enabled in development mode

### Database Studio

```bash
turbo db:studio
```

Opens Drizzle Studio for visual database inspection.
