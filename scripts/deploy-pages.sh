#!/usr/bin/env bash
# Build the static export and publish it to the gh-pages branch.
#
# Used instead of a GitHub Actions workflow because publishing one needs a
# token with the `workflow` scope. Run with: npm run deploy
set -euo pipefail

REPO_URL="$(git config --get remote.origin.url)"
BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/wtc-website}"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

echo "→ building with basePath ${BASE_PATH}"
rm -rf .next out
NEXT_PUBLIC_BASE_PATH="$BASE_PATH" npm run build

echo "→ staging"
cp -R out/. "$STAGE"/
# Without this, Pages runs Jekyll and drops the _next directory.
touch "$STAGE/.nojekyll"

echo "→ pushing to gh-pages"
cd "$STAGE"
git init -q -b gh-pages
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-$(git -C "$OLDPWD" config user.name)}" \
    -c user.email="${GIT_AUTHOR_EMAIL:-$(git -C "$OLDPWD" config user.email)}" \
    commit -qm "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -q --force "$REPO_URL" gh-pages

echo "✓ deployed"
