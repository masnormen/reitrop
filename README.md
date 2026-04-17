# Reitrop

(read in reverse)

README with setup steps:

### Setup

- Install PNPM packages

```bash
pnpm install
```

- Fill in your `.env` file based on the `.env.example` file (I already have a script to do that for you).

```bash
pnpm setup-project
```

### Run development server

```bash
pnpm install
pnpm dev
```

### Run Docker build

```bash
docker build -f apps/api/Dockerfile . --progress=plain -t starter-api
docker build -f apps/web/Dockerfile . --progress=plain -t starter-web
```

### Running built Docker images

```bash
docker run -p 4200:4200 starter-api
docker run -p 3000:3000 starter-web
```