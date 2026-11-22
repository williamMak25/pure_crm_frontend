# syntax=docker/dockerfile:1
# Two targets:
#   dev   Vite dev server, src is bind-mounted, live reload
#   prod  (default) static build served by nginx, which also proxies /api to the backend
FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm npm ci


FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npx", "vite", "dev", "--host", "0.0.0.0", "--port", "5173"]


FROM base AS build
# Public static env vars are inlined at build time, so they are build args, not runtime env.
ARG API_BASE_URL=/api
ARG API_MOCK=false
ENV API_BASE_URL=$API_BASE_URL \
    API_MOCK=$API_MOCK
COPY . .
RUN npm run build


FROM nginx:1.29-alpine AS prod
# Backend the /api proxy forwards to; templates/*.template are envsubst'ed on start.
ENV API_UPSTREAM=http://host.docker.internal:8100
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
EXPOSE 80
