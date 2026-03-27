# 1. fázis: Build

# 1. fázis: Build
FROM node:20-alpine as build

# Itt kell definiálni az ARG-okat a FROM után!
ARG VITE_API_BASE_URL

# Átadjuk az ENV-nek, hogy a build folyamat (Vite) lássa őket
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# A build parancs most már beleégeti a fenti értékeket a JS fájlokba
RUN npm run build

# 2. fázis: Kiszolgálás Nginx-szel
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html/kozitabor
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80