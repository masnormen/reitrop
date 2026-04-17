ARG APP_NAME=web
ARG TURBO_VERSION=2.9.6

FROM node:24.14.1-alpine AS base
ARG APP_NAME
ARG TURBO_VERSION

RUN apk add --no-cache libc6-compat

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN npm install -g turbo@${TURBO_VERSION}

WORKDIR /app

FROM base AS pruner
ARG APP_NAME

COPY . .
RUN turbo prune --scope=${APP_NAME} --docker

FROM base AS builder
ARG APP_NAME

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/apps/${APP_NAME}/.env ./apps/${APP_NAME}/.env
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the full source code for the isolated app
COPY --from=pruner /app/out/full/ .

# Build the project
RUN turbo build --filter=${APP_NAME}

FROM base AS runner
ARG APP_NAME

RUN apk add --no-cache libc6-compat

WORKDIR /app
ENV NODE_ENV=production

# Install dotenvx
RUN apk --no-cache add curl
RUN curl -sfS https://dotenvx.sh/install.sh | sh

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 tanstack
USER tanstack

# Copy only the standalone output from the builder stage
COPY --from=builder --chown=tanstack:nodejs /app/apps/${APP_NAME}/.output ./.output
COPY --from=builder --chown=tanstack:nodejs /app/apps/${APP_NAME}/.env ./.env

EXPOSE 3000

CMD ["dotenvx", "run", "-f", ".env", "--", "node", ".output/server/index.mjs"]