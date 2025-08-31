#!/bin/sh
echo "Starting auth worker..."
npx wrangler dev --remote --config ./auth/wrangler.jsonc &

echo "Starting todo worker..."
npx wrangler dev --remote --config ./todo/wrangler.jsonc &

echo "Starting blog worker..."
npx wrangler dev --remote --config ./blog/wrangler.jsonc &

wait