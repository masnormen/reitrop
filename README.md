# Starter

README with setup steps (DB migration, seed data, login accounts per role)

### Setup

- Install PNPM packages

```bash
pnpm install
```

- Fill in your `.env` file based on the `.env.example` file

### DB - Generate & Migrate

```bash
turbo db:migrate
turbo db:generate
```

### DB - Seed Data

```bash
turbo db:seed
```

### Run development server

```bash
pnpm install
pnpm dev
```
