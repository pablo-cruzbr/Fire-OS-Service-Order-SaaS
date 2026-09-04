# Stage 1 — build: instala tudo (incluindo devDependencies) e compila TS -> JS
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2 — runtime: só o necessário pra rodar, sem TypeScript nem devDependencies
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=build /app/dist ./dist

EXPOSE 3334

CMD ["node", "dist/server.js"]
