#!/usr/bin/env bash
# Build and deploy the portfolio to Firebase Hosting.
#   bash scripts/deploy-firebase.sh <firebase-project-id>
# On your own computer: run `npx firebase-tools login` once first.
# In a Claude cloud session: set FIREBASE_SERVICE_ACCOUNT (the service-account JSON, role "Firebase Hosting Admin")
# and FIREBASE_PROJECT in the environment's settings; this script picks them up.
set -euo pipefail
cd "$(dirname "$0")/.."
PROJECT=${1:-${FIREBASE_PROJECT:?pass the Firebase project id}}
if [ -n "${FIREBASE_SERVICE_ACCOUNT:-}" ]; then
  KEY=$(mktemp); printf '%s' "$FIREBASE_SERVICE_ACCOUNT" > "$KEY"; trap 'rm -f "$KEY"' EXIT
  export GOOGLE_APPLICATION_CREDENTIALS=$KEY
fi
npm run build
npx --yes firebase-tools@13 deploy --only hosting --project "$PROJECT" --non-interactive
