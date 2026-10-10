#!/usr/bin/env bash
# Build and deploy the portfolio to Cloudflare Pages -> https://<project>.pages.dev
#   bash scripts/deploy-cloudflare.sh [project-name=appify-portfolio]
# Needs CLOUDFLARE_API_TOKEN ("Edit Cloudflare Workers" template) and CLOUDFLARE_ACCOUNT_ID in the environment,
# or run `npx wrangler login` first on your own computer.
set -euo pipefail
cd "$(dirname "$0")/.."
NAME=${1:-appify-portfolio}
npm run build
npx --yes wrangler@4 pages project create "$NAME" --production-branch main 2>/dev/null || true   # first deploy only
npx --yes wrangler@4 pages deploy dist --project-name "$NAME" --branch main --commit-dirty=true
