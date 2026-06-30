#!/bin/sh
set -e

DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"

echo "[entrypoint] Waiting for MySQL at $DB_HOST:$DB_PORT ..."
until nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    echo "[entrypoint] MySQL not ready - retrying in 2s..."
    sleep 2
done
echo "[entrypoint] MySQL is up!"

echo "[entrypoint] Pushing database schema..."
pnpm drizzle-kit push --force

echo "[entrypoint] Starting application..."
exec node dist/index.js
