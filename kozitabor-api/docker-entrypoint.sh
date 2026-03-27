#!/bin/sh
set -e

# Ellenőrizzük, hogy a DATABASE_URL elérhető-e a Prisma Config számára
if [ -z "$DATABASE_URL" ]; then
  echo "HIBA: DATABASE_URL nincs definiálva!"
  exit 1
fi

echo "Adatbázis kész. Migrációk futtatása a config alapján..."
npx prisma migrate deploy

echo "User seeder futtatása..."
node dist/seeder/users.js

echo "Backend indítása..."
exec "$@"