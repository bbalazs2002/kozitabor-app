FROM node:20-alpine AS build

WORKDIR /app

# Függőségek telepítése
COPY package*.json ./
RUN npm install

# Forráskód másolása
COPY . .

# 1. PRISMA GENERÁLÁS (Placeholderrel a build fázishoz)
RUN DATABASE_URL="postgresql://placeholder:5432/db" npx prisma generate

# 2. TYPESCRIPT FORDÍTÁS (Ez hozza létre a /dist mappát)
RUN npm run build

# --- Runtime fázis (kisebb image méretért) ---
FROM node:20-alpine

WORKDIR /app

# Függőségek
COPY package*.json ./
RUN npm install --production

# 1. A lefordított kód másolása
COPY --from=build /app/dist ./dist

# 2. A legenerált Prisma kliens másolása (ez a kódból való eléréshez kell)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# A Prisma config és a schema másolása
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/prisma ./prisma

# Indító script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]