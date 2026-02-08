#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Scanning for hardcoded hex colors outside design token files..."

rg -n --glob '!design/tokens/**' --glob '!docs/**' '#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})' app features design/primitives || true

echo "Done."
