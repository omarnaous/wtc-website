#!/usr/bin/env bash
# Build the static export and publish it to the gh-pages branch.
#
# ⚠️ THIS NOW PUBLISHES AN EMPTY SHOP. Do not run it without reading this.
#
# It used to work because the catalogue was a file: src/data/products.ts held 26
# watches and their photography lived in public/, so a build with no database
# behind it still had something to render. Both are gone — the catalogue is D1
# rows and every photograph is an R2 object — and a static export can reach
# neither. It will build and deploy happily, and the result is a correct-looking
# site with no watches in it.
#
# Either delete this script and the `deploy:pages` alias, or give the export a
# way to read the catalogue at build time (fetch the live /products data and
# write it to a file the pages can import). Leaving it as it is means one
# mistyped command publishes an empty storefront under the client's name.
#
# The live shop runs on Cloudflare Workers: `npm run deploy`.
#
# The dashboard is moved aside for the build. `output: export` prerenders every
# route, and /admin reads cookies on every request — it cannot be a static file,
# and leaving it in place fails the build.
#
# Its components go with it: `next build` typechecks the whole of src/, and
# src/components/admin imports the server actions that live under src/app/admin,
# so hiding the routes alone leaves those imports dangling. Nothing in the
# storefront imports them, which is what makes this safe.
#
# Used instead of a GitHub Actions workflow because publishing one needs a
# token with the `workflow` scope. Run with: npm run deploy:pages
set -euo pipefail

REPO_URL="$(git config --get remote.origin.url)"
BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/wtc-website}"
STAGE="$(mktemp -d)"
HIDDEN="$(mktemp -d)"

# Everything the static export cannot contain.
#
#   admin / api          — read cookies and D1 on every request
#   components/admin     — import the server actions under src/app/admin
#   (site)/order/[id]    — a receipt for an order that does not exist at build
#                          time; `output: export` demands generateStaticParams
#   (site)/checkout      — placing an order is a server action, and those are
#                          not supported in a static export at all
#   cart/CheckoutForm    — imports that action
#
# With those gone the preview cannot sell anything, so COMMERCE_ENABLED in
# src/lib/runtime.ts also hides the bag and the buy buttons for this build —
# a preview with a dead bag button is worse than one without it.
EXCLUDED=(
  src/app/admin
  src/app/api
  src/components/admin
  "src/app/(site)/order"
  "src/app/(site)/checkout"
  src/components/cart/CheckoutForm.tsx
)

# Runs on every exit, so an interrupted or failed build never leaves part of
# the app sitting outside the tree.
#
# This function deletes nothing. An earlier version cleaned up $HIDDEN at the
# end, which meant any restore that silently failed to match its stashes took
# ~35 untracked source files with it. The stash is now left on disk and its
# location printed: worst case you copy the files back by hand, which beats
# losing them. $STAGE is the build output and safe to drop.
restore() {
  local missing=0
  for path in "${EXCLUDED[@]}"; do
    stash="$HIDDEN/$(echo "$path" | tr '/()' '___')"
    if [ -e "$stash" ]; then
      mkdir -p "$(dirname "$path")"
      mv "$stash" "$path"
    fi
    if [ ! -e "$path" ]; then
      echo "✘ NOT RESTORED: $path" >&2
      missing=1
    fi
  done
  rm -rf "$STAGE"
  if [ "$missing" = "1" ]; then
    echo "" >&2
    echo "Some paths were not put back. They are still in:" >&2
    echo "  $HIDDEN" >&2
    echo "Copy them back before doing anything else." >&2
  else
    rm -rf "$HIDDEN"
  fi
}
trap restore EXIT

# Editing this script while it is running makes bash read the rest of the file
# from a shifted offset — which is one way the restore above can go wrong. Work
# on a copy if you need to change it mid-build.

echo "→ setting the server-only routes aside"
for path in "${EXCLUDED[@]}"; do
  if [ -e "$path" ]; then mv "$path" "$HIDDEN/$(echo "$path" | tr '/()' '___')"; fi
done

echo "→ building with basePath ${BASE_PATH}"
# `out` is what gets published, so it has to be genuinely clean.
rm -rf out
# `.next` is only a cache, and a dev server running alongside this keeps
# regenerating .next/types — on APFS that races `rm -rf` into ENOTEMPTY. Worth
# clearing, not worth failing the deploy over.
rm -rf .next 2>/dev/null || rm -rf .next 2>/dev/null || true
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH="$BASE_PATH" ./node_modules/.bin/next build

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
